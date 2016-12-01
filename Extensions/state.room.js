/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('state.room');
 * mod.thing == 'a thing'; // true
 */
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var Goals = require("strategy.goals");
var Types = require("strategy.types");
var logger = require("core.logger");

var roomState = function(room) {
    this.initialize(room);
};

roomState.prototype = {
    types: [
        "infant",
        "growing",
        "expand"
    ],

    initialize: function(room) {
        this.room = room;
        this._gatherInfo();
        this.determineType();
    },

    _gatherInfo: function() {

        //Check who controls it
        this.owned = this.room.controller.my;

        //Get own spawns
        this.mySpawns = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN &&
                structure.my);
            }
        });

        //Get enemy spawns
        this.enemySpawns = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN &&
                !structure.my);
            }
        });

        //Check controller level
        this.level = this.room.controller.level;

        //Check if in safe mode
        this.safeMode = (typeof this.room.controller.safeMode != "undefined");
        if(this.safeMode)
            this.safeModeRemaining = this.room.controller.safeMode;
            
        this.creeps = {};
            
        //Get the all in this room
        this.creeps.all = this.room.find(FIND_MY_CREEPS);
            
        //Get the harvesters in this room
        this.creeps.harvesters = this.room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return (creep.memory.role == "harvester");
            }
        });
        
        //Get the builders in this room
        this.creeps.builders = this.room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return (creep.memory.role == "builder");
            }
        });
        
        //Get the upgraders in this room
        this.creeps.upgraders = this.room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return (creep.memory.role == "upgrader");
            }
        });
        
        //Get the towers in this room
        this.myTowers = this.room.find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}
        });
        
        //Get the extensions in this room
        this.myExtensions = this.room.find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}
        });
        
        this.sources = this.room.find(FIND_SOURCES);
        
        //Check total available energy in sources
        this.energyHarvestable = 0;
        for(var x in this.sources)
            this.energyHarvestable += this.sources[x].energy;
            
        //Find the total available energy capacity of room and total capacity
        var targets = this.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER);
                    }
            });
            this.energyCapacityAvailable = 0;
            this.energyCapacity = 0;
            if(targets.length > 0) {
                for(var x in targets) {
                    this.energyCapacity += targets[x].energyCapacity
                    if(targets[x].energy < targets[x].energyCapacity)
                        this.energyCapacityAvailable += (targets[x].energyCapacity - targets[x].energy);
                }
            }
    },

    determineType: function() {
        if(this.type != null)
            return this.type;
        for(var x in Types.room) {
            if(this.typeMatches(Types.room[x])) {
                this.type = Types.room[x];
                logger.log(this.room.name+" determined to be type: "+this.type.name);
            }
        }
        if(this.type == null)
            return false;
    },

    typeMatches: function(type) {
        //Check who controls it
        if(this.owned != type.owned)
            return false;

        //Check Own Spawn Count
        if(!(this.mySpawns.length >= type.minSpawns && this.mySpawns.length <= type.maxSpawns ))
            return false;

        //Check Enemy Spawn Count
        if(!(this.enemySpawns.length >= type.minEnemySpawns && this.enemySpawns.length <= type.maxEnemySpawns ))
            return false;


        if(!(this.level >= type.minLevel && this.level <= type.maxLevel))
            return false;

        if(typeof type.safe != "undefined" && this.safeMode != type.safe)
            return false;

        return true;

    },
    
    run: function() {
        //Get the goals that apply
        if(this.type === false || this.type == null) {
            logger.error("Cannot do anything in room "+this.room.name+" because could not identify room type.")
            return false;
        }
        logger.log("Trying to get goals for: "+this.type.name);
        this.goals = Goals.room[this.type.name];
        this.steps = this.goals.steps;
        this.step = false;
        
        for(var i=0; i<this.steps.length; i++) {
            if(this.onStep(this.steps[i]))
                this.step = this.steps[i];
        }
        
        if(this.step == false) {
            console.error("Could not identify the next step for room "+this.room.name);
            return false;
        }
        this._processStep(this.step);
        
        
        //Handle Creeps
        for(var x in this.creeps.all) {
            var creep = this.creeps.all[x];
            if(creep.memory.role == 'harvester') {
                if(this.energyCapacityAvailable > 0)
                    roleHarvester.run(creep);
                else if(roleBuilder.stuffToBuild(creep) > 0)
                    roleBuilder.run(creep);
                else if(roleUpgrader.upgradeRequired(creep))
                    roleUpgrader.run(creep);
                else
                    roleHarvester.run(creep);
            }
            if(creep.memory.role == 'upgrader') {
                if(roleUpgrader.upgradeRequired(creep))
                    roleUpgrader.run(creep);
                else if(roleBuilder.stuffToBuild(creep) > 0)
                    roleBuilder.run(creep);
                else
                    roleHarvester.run(creep);
            }
            if(creep.memory.role == 'builder') {
                if(roleBuilder.stuffToBuild(creep) > 0)
                    roleBuilder.run(creep);
                else if(roleUpgrader.upgradeRequired(creep))
                    roleUpgrader.run(creep);
                else
                    roleHarvester.run(creep);
            }
        }
        
        return true;
    },
    
    onStep: function(step) {
        var needsDone = false;
        if(step.spawns > this.room.spawns)
            needsDone = true;
            
        if(step.creeps.harvesters > this.creeps.harvesters.length)
            needsDone = true;
            
        if(step.creeps.builders > this.creeps.builders.length)
            needsDone = true;
            
        if(step.creeps.upgraders > this.creeps.upgraders.length)
            needsDone = true;
            
        if(step.level > this.level)
            needsDone = true;
            
        if(step.towers > this.myTowers.length)
            needsDone = true;
            
        if(step.extensions > this.myExtensions.length)
            needsDone = true;
            
        return needsDone;
    },
    
    createCreep: function(definitions, roleName) {
        var newName = false;
        for(var x in definitions) {
            var definition = definitions[x];
            for(var y in this.mySpawns) {
                if(this.mySpawns[y].canCreateCreep(definition) == OK) {
                    newName = this.mySpawns[y].createCreep(definition, undefined, {role: roleName});
                    break;
                }
            }
            if(newName !== false)
                break;
        }
        return newName;
    },
    
    _processStep: function(step) {
        
        var doingSomething = false;
        //Spawn creation needs implemented.
        //if(step.spawns > this.room.spawns)
            
        //Harvester Creation
        if(!doingSomething && step.creeps.harvesters > this.creeps.harvesters.length) {
            //Build a Harvester
            this.createCreep(roleHarvester.definitions, roleHarvester.type)
            doingSomething = true;
        }
            
        //Builder Creation
        if(!doingSomething && step.creeps.builders > this.creeps.builders.length) {
            //Build a Builder
            this.createCreep(roleBuilder.definitions, roleBuilder.type)
            doingSomething = true;
        }
            
        //Upgrader Creation
        if(!doingSomething && step.creeps.upgraders > this.creeps.upgraders.length) {
            //Build an Upgrader
            this.createCreep(roleUpgrader.definitions, roleUpgrader.type)
            doingSomething = true;
        }
        
        logger.log("Creeps are all set for this step.");
            
        if(step.level > this.level) {
            this.room.memory.needsUpgrade = true;
            logger.log("Upgrading the Room");
            doingSomething = true;
        }
        else
            this.room.memory.needsUpgrade = false;
            
        if(typeof step.roads != "undefined" && step.roads)
            this.buildRoads();
            
        if(step.extensions > this.myExtensions.length) {
            var build = step.extensions - this.myExtensions.length;
            //Check how many construction sites there are for extensions.
            var cs = this.room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: function(site) {
                    return site.structureType == STRUCTURE_EXTENSION;
                }
            });
            build = build - cs.length;
            //Grab all Road Spaces
            var roads = this.room.find(FIND_STRUCTURES, {
                filter: function(structure) {
                    return (structure.structureType == STRUCTURE_ROAD);
                }
            });
            if(build == 0)
                return false;
            
            for(var x in roads) {
                if(build == 0)
                    break;
                //Try one above, one below, one right, and one left...
                var result = this.createNear(roads[x].pos, STRUCTURE_EXTENSION);
                if(result == OK) {
                    build = build-1;
                    continue;
                }
                else if(result == ERR_FULL) {
                    logger.warn("Maximum number of construction sites reached");
                    break;
                }
                else if(result == ERR_RCL_NOT_ENOUGH) {
                    logger.log("Room Controller not high enough to build anymore extensions");
                }
                
            }
                //For each road space, look for a valid position in a 3 space radius...
            doingSomething = true;
        }
            
        if(step.towers > this.myTowers.length) {
            var build = step.towers - this.myTowers.length;
            //Build a tower near each spawn
            for(var x in this.mySpawns) {
                if(build == 0)
                    break;
                var spawn = this.mySpawns[x];
                //Tower already exists
                if(typeof spawn.memory.tower != "undefined") {
                    var loc = String(spawn.memory.tower).split(",");
                    var found = this.room.lookForAt(LOOK_STRUCTURES, loc[0], loc[1]);
                    if(found.length > 0)
                        continue;
                }
                
                var result = this.createNear(spawn.pos, STRUCTURE_TOWER);
                if(result == OK) {
                    build = build - 1;
                    spawn.memory.tower = this.latestCreationLocation[0]+","+this.latestCreationLocation[1];
                    continue;
                }
                else if(result == ERR_FULL) {
                    logger.warn("Maximum number of construction sites reached.");
                    break;
                }
                else if(result == ERR_RCL_NOT_ENOUGH) {
                    logger.log("Room Controller not high enough to build anymore towers.");
                }
                
            }
            
            //And one near the Control Center
            if(build > 0) {
                
                var spawn = this.room.controller;
                
                //Tower already exists
                var buildIt = true;
                if(typeof Memory.controller != "undefined" &&
                    typeof Memory.controller[spawn.id] != "undefined" &&
                    typeof Memory.controller[spawn.id].tower != "undefined") {
                    var loc = String(spawn.memory.tower).split(",");
                    var found = this.room.lookForAt(LOOK_STRUCTURES, loc[0], loc[1]);
                    if(found.length > 0)
                        buildIt = false;
                }
                
                if(buildIt) {
                    var result = this.createNear(spawn.pos, STRUCTURE_TOWER, 5);
                    if(result == OK) {
                        build = build - 1;
                        if(typeof Memory.controller == "undefined")
                            Memory.controller = {};
                        if(typeof Memory.controller[spawn.id] == "undefined")
                            Memory.controller[spawn.id] = { };
                        Memory.controller[spawn.id].tower = this.latestCreationLocation[0]+","+this.latestCreationLocation[1];
                    }
                    else if(result == ERR_FULL) {
                        logger.warn("Maximum number of construction sites reached.");
                    }
                    else if(result == ERR_RCL_NOT_ENOUGH) {
                        logger.log("Room Controller not high enough to build anymore towers.");
                    }
                }
                
            }
            
            doingSomething = true;
        }
    },
    
    createNear: function(location, type, range) {
        if(typeof range == "undefined")
            range = 1;
            
        var result = OK;
        
        for(var x = -range; x<= range; x++)
            for(var y = -range; y<= range; y++) {
                var result = this.room.createConstructionSite(location.x + x, location.y + y, STRUCTURE_EXTENSION);
                if(result == OK) {
                    this.latestCreationLocation = [location.x + x, location.y + y];
                    return result;
                }
            }
        return result;
    },
    
    buildRoads: function() {
        
        if(typeof this.room.memory.checkRoads != "undefined" && !this.room.memory.checkRoads)
            return false;
        //We want to build from the sources to the spawns...
        
        //for each spawn...
        for(var x in this.mySpawns) {
            for(var y in this.sources) { 
                var path = this.room.findPath(this.mySpawns[x].pos, this.sources[y].pos);
                //Build it!
                for(var z in path) {
                    var look = this.room.lookForAt(LOOK_STRUCTURES, path[z].x, path[z].y);
                    if(look.length == 0) {
                        var result = this.room.createConstructionSite(path[z].x, path[z].y, STRUCTURE_ROAD);
                        if(result == ERR_FULL) {
                            logger.warn("Maximum number of construction sites reached");
                            return false;
                        }
                    }
                }
            }
        }
        
        this.room.memory.checkRoads = false;
    }
};

module.exports = roomState;
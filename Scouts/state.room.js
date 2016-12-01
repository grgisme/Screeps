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
var roleScout = require("role.scout");
var roleTower = require("role.tower");
var Goals = require("strategy.goals");
var Types = require("strategy.types");
var logger = require("core.logger");

var roomState = function(room, gameState) {
    this.initialize(room, gameState);
};

roomState.prototype = {
    types: [
        "infant",
        "growing",
        "expand"
    ],

    initialize: function(room, gameState) {
        this.room = room;
        this._gatherInfo();
        this.determineType();
        this.gameState = gameState;
    },

    _gatherInfo: function() {
        
         logger.cpu();
         logger.log("_gatherInfo starting");

        //Check who controls it
        this.owned = this.room.controller.my;

        //Get own spawns
        if(typeof this.room.memory.mySpawns != "undefined")
            this.mySpawns = this.room.memory.mySpawns;
        else {
            this.mySpawns = this.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN &&
                    structure.my);
                }
            });
        }
        
        //Get enemy spawns
        if(typeof this.room.memory.enemySpawns != "undefined")
            this.enemySpawns = this.room.memory.enemySpawns;
        else {
            this.enemySpawns = this.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_SPAWN &&
                    !structure.my);
                }
            });
        }
        

        //Check controller level
        this.level = this.room.controller.level;

        //Check if in safe mode
        this.safeMode = (typeof this.room.controller.safeMode != "undefined");
        if(this.safeMode)
            this.safeModeRemaining = this.room.controller.safeMode;
            
        this.creeps = {};
            
        //Get all creeps in this room
        if(typeof this.room.memory.allCreeps != "undefined")
            this.creeps.all = this.room.memory.allCreeps;
        else {
            this.creeps.all = this.room.find(FIND_MY_CREEPS);
        }
        
        //Get the harvesters in this room
        if(typeof this.room.memory.harvesters != "undefined")
            this.creeps.harvesters = this.room.memory.harvesters;
        else {
            this.creeps.harvesters = this.room.find(FIND_MY_CREEPS, {
                filter: (creep) => {
                    return (creep.memory.role == "harvester");
                }
            });
        }
            
        
        
        //Get the builders in this room
        if(typeof this.room.memory.builders != "undefined")
            this.creeps.builders = this.room.memory.builders;
        else {
            this.creeps.builders = this.room.find(FIND_MY_CREEPS, {
                filter: (creep) => {
                    return (creep.memory.role == "builder");
                }
            });
        }
        
        //Get the upgraders in this room
        if(typeof this.room.memory.upgraders != "undefined")
            this.creeps.upgraders = this.room.memory.upgraders;
        else {
            this.creeps.upgraders = this.room.find(FIND_MY_CREEPS, {
                filter: (creep) => {
                    return (creep.memory.role == "upgrader");
                }
            });
        }
        
        //Get the towers in this room
        if(typeof this.room.memory.myTowers != "undefined")
            this.myTowers = this.room.memory.myTowers;
        else {
            this.myTowers = this.room.find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}
            });
        }

        
        //Get the extensions in this room
        if(typeof this.room.memory.myExtensions != "undefined")
            this.myExtensions = this.room.memory.myExtensions;
        else {
            this.myExtensions = this.room.find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}
            });
        }
        
        //Get the sources in this room
        if(typeof this.room.memory.sources != "undefined")
            this.sources = this.room.memory.sources;
        else {
            this.sources = this.room.find(FIND_SOURCES);
        }
        
        
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
         logger.log("_gatherInfo ending");
         logger.cpu();
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
            logger.error("Cannot do anything in room "+this.room.name+" because could not identify room type.");
            this.handleCreeps();
            return false;
        }
        logger.log("Trying to get goals for: "+this.type.name);
        this.goals = Goals.room[this.type.name];
        if(typeof this.goals == "undefined" || typeof this.goals.steps == "undefined" ) {
            logger.error("Could not identify the next step for room "+this.room.name);
            this.handleCreeps();
            return false;
        }
        this.steps = this.goals.steps;
        this.step = false;
        
        
         logger.cpu();
         logger.log("Determining Which Step");
        
        for(var i=0; i<this.steps.length; i++) {
            if(this.onStep(this.steps[i]))
                this.step = this.steps[i];
        }
         logger.log("Steps determined");
         logger.cpu();
        
        if(this.step == false) {
            logger.error("Could not identify the next step for room "+this.room.name);
            this.handleCreeps();
            return false;
        }
        
         logger.cpu();
         logger.log("Processing Step");
        this._processStep(this.step);
         logger.cpu();
         logger.log("Step Procssed");
        
        
         logger.cpu();
         logger.log("Handling Creeps");
        //Handle Creeps
        this.handleCreeps();
        
         logger.log("Creeps Handled");
         logger.cpu();
        
        return true;
    },
    
    handleCreeps: function() {
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
        for(var x in this.myTowers)
            roleTower.run(this.myTowers[x]);
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
            
         logger.cpu();
         logger.log("Harvester Creation");
        //Harvester Creation
        if(!doingSomething && step.creeps.harvesters > this.creeps.harvesters.length) {
            //Build a Harvester
            this.createCreep(roleHarvester.definitions, roleHarvester.type)
            doingSomething = true;
        }
            
         logger.cpu();
         logger.log("Builder Creation");
        //Builder Creation
        if(!doingSomething && step.creeps.builders > this.creeps.builders.length) {
            //Build a Builder
            this.createCreep(roleBuilder.definitions, roleBuilder.type)
            doingSomething = true;
        }
            
         logger.cpu();
         logger.log("Upgrader Creation");
        //Upgrader Creation
        if(!doingSomething && step.creeps.upgraders > this.creeps.upgraders.length) {
            //Build an Upgrader
            this.createCreep(roleUpgrader.definitions, roleUpgrader.type);
            doingSomething = true;
        }
        
         logger.cpu();
         logger.log("Scout Creation");
        //Scout Creation
        if(!doingSomething && this.gameState.neededScouts > 0) {
            var result = this.createCreep(roleScout.definitions, roleScout.type);
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
            
         logger.cpu();
         logger.log("Build Roads");
        if(typeof step.roads != "undefined" && step.roads)
            this.buildRoads(step);
            
         logger.cpu();
         logger.log("Roads Built");
            
            
         logger.cpu();
         logger.log("Build Extensions");
         this.buildExtensions(step);
         logger.cpu();
         logger.log("Extensions Built");
            
        if(step.towers > this.myTowers.length) {
            this.buildTowers(step);
            
         logger.cpu();
         logger.log("Tower Built");
            
            doingSomething = true;
        }
    },
    
    buildTowers: function(step) {
        
        //Check how many construction sites there are for towers.
        var cs = this.room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: function(site) {
                return site.structureType == STRUCTURE_TOWER;
            }
        });
        
        var total = this.myTowers.length + cs.length;
        
        if(this.room.controller.level < 3) {
            logger.log("Room Controller not high enough to build anymore towers");
            return false;
        }
        
        if(this.room.controller.level < 5 && total >= 1) {
            logger.log("Room Controller not high enough to build anymore towers");
            return false;
        }
            
        if(this.room.controller.level < 7 && total >= 2) {
            logger.log("Room Controller not high enough to build anymore towers");
            return false;
        }
            
        if(this.room.controller.level < 8 && total >= 3) {
            logger.log("Room Controller not high enough to build anymore towers");
            return false;
        }
            
        if(this.room.controller.level == 8 && total >= 6) {
            logger.log("Room Controller not high enough to build anymore towers");
            return false;
        }
            
        var build = step.towers - this.myTowers.length;
        
        //Build a tower near each spawn
        for(var x in this.mySpawns) {
            if(build == 0)
                break;
            var spawn = this.mySpawns[x];
            //Tower already exists
            if(typeof spawn.memory.tower != "undefined") {
                var loc = String(spawn.memory.tower).split(",");
                var found = this.room.lookForAt(LOOK_STRUCTURES, parseInt(String(loc[0])), parseInt(String(loc[1])));
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
                return false;
            }
            else if(result == ERR_RCL_NOT_ENOUGH) {
                logger.log("Room Controller not high enough to build anymore towers.");
                return false;
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
    },
    
    buildExtensions: function(step) {
        if(this.room.controller.level == 1)
            return false;
            
        if(step.extensions > this.myExtensions.length) {
            var build = step.extensions - this.myExtensions.length;
            //Check how many construction sites there are for extensions.
            var cs = this.room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: function(site) {
                    return site.structureType == STRUCTURE_EXTENSION;
                }
            });
            var total = this.myExtensions.length + cs.length;
            
            
            
            logger.log("Level: "+this.room.controller.level+" -- Extensions: "+this.myExtensions.length);
            if(this.room.controller.level == 2 && total >= 5) {
                logger.log("Room Controller not high enough to build anymore extensions");
                return false;
            }
                
            if(this.room.controller.level == 3 && total >= 10) {
                logger.log("Room Controller not high enough to build anymore extensions");
                return false;
            }
                
            if(this.room.controller.level == 4 && total >= 20) {
                logger.log("Room Controller not high enough to build anymore extensions");
                return false;
            }
                
            if(this.room.controller.level == 5 && total >= 30) {
                logger.log("Room Controller not high enough to build anymore extensions");
                return false;
            }
                
            if(this.room.controller.level == 6 && total >= 40) {
                logger.log("Room Controller not high enough to build anymore extensions");
                return false;
            }
                
            if(this.room.controller.level == 7 && total >= 50) {
                logger.log("Room Controller not high enough to build anymore extensions");
                return false;
            }
                
            if(this.room.controller.level == 8 && total >= 60) {
                logger.log("Room Controller not high enough to build anymore extensions");
                return false;
            }
            
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
                    return false;
                }
                else if(result == ERR_RCL_NOT_ENOUGH) {
                    logger.log("Room Controller not high enough to build anymore extensions");
                    return false;
                }
                
            }
                //For each road space, look for a valid position in a 3 space radius...
            doingSomething = true;
        }
    },
    
    createNear: function(location, type, range) {
        if(typeof range == "undefined")
            range = 1;
            
        var result = OK;
        
        for(var x = -range; x<= range; x++)
            for(var y = -range; y<= range; y++) {
                if(x == 0 && y == 0)
                    continue;
                var result = this.room.createConstructionSite(location.x + x, location.y + y, type);
                if(result == OK) {
                    this.latestCreationLocation = [location.x + x, location.y + y];
                    return result;
                }
            }
        return result;
    },
    
    buildRoads: function(step) {
        
        if(typeof this.room.memory.checkRoads != "undefined" && !this.room.memory.checkRoads)
            return false;
        //We want to build from the sources to the spawns...
        
        //for each spawn...
        if(typeof step.spawnRoads != "undefined" && step.spawnRoads) {
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
        }
        
        if(typeof step.controllerRoad != "undefined" && step.controllerRoad) {
            for(var y in this.sources) { 
                    var path = this.room.findPath(this.room.controller.pos, this.sources[y].pos);
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
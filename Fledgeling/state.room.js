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
    
    _processStep: function(step) {
        
        var doingSomething = false;
        //Spawn creation needs implemented.
        //if(step.spawns > this.room.spawns)
            
        //Harve,ster Creation
        if(!doingSomething && step.creeps.harvesters > this.creeps.harvesters.length) {
            //Build a Harvester
            var newName = this.mySpawns[0].createCreep(roleHarvester.definition, undefined, {role: 'harvester'});
            doingSomething = true;
        }
            
        //Builder Creation
        if(!doingSomething && step.creeps.builders > this.creeps.builders.length) {
            //Build a Builder
            var newName = this.mySpawns[0].createCreep(roleBuilder.definition, undefined, {role: 'builder'});
            doingSomething = true;
        }
            
        //Upgrader Creation
        if(!doingSomething && step.creeps.upgraders > this.creeps.upgraders.length) {
            //Build an Upgrader
            var newName = this.mySpawns[0].createCreep(roleUpgrader.definition, undefined, {role: 'upgrader'});
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
            
            doingSomething = true;
        }
            
        if(step.towers > this.myTowers.length) {
            
            doingSomething = true;
        }
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
                    console.log("Look Length: "+look.length);
                    if(look.length == 0) {
                        this.room.createConstructionSite(path[z].x, path[z].y, STRUCTURE_ROAD);
                    }
                }
            }
        }
        
        this.room.memory.checkRoads = false;
    }
};

module.exports = roomState;
var logger = require("core.logger");

var roleHarvester = {
    
    cost: 200,
    type: "harvester",
    
    definition: [WORK,CARRY,MOVE],
    
    definitions: [
        [WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
        [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
        [WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE],
        [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        [WORK,WORK,CARRY,MOVE,MOVE,MOVE],
        [WORK,WORK,CARRY,MOVE,MOVE],
        [WORK,CARRY,CARRY,MOVE,MOVE],
        [WORK,CARRY,MOVE]
    ],

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(typeof creep.memory.mode == "undefined")
            creep.memory.mode = "harvest";
        
        if(creep.carry.energy == 0) {
            creep.memory.mode = "harvest";
        }
        else if(creep.carry.energy == creep.carryCapacity) {
            creep.memory.mode = "dropoff";
        }
        
	    if(creep.memory.mode == "harvest") {
	        
	        //Look for dropped energy?
	        var energy = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
	        if(energy) {
	            if(creep.pickup(energy) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(energy);
	            }
	            return true;
	        }
	        
	        if(typeof creep.memory.mySource == "undefined" || Game.getObjectById(creep.memory.mySource).energy == 0) {
                var target = creep.pos.findClosestByRange(FIND_SOURCES, {
                    filter: function(source) {
                        return source.energy > 0;
                    }
                });
                if(target != null)
                    creep.memory.mySource = target.id;
	        }
	        
	        var target = Game.getObjectById(creep.memory.mySource);
            
            
            if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER ||
                                structure.structureType == STRUCTURE_CONTAINER);
                    }
            });
            if(targets.length > 0) {
                var moving = false;
                for(var x in targets) {
                    if(targets[x].energy >= targets[x].energyCapacity)
                        continue;
                    if(creep.transfer(targets[x], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        var result = creep.moveTo(targets[x]);
                        if(result == ERR_NO_PATH)
                            logger.error("Creep can't get to location");
                        moving = true;
                    }
                }
                if(!moving) { // Move to the first one
                    var result = creep.moveTo(targets[0]);
                    if(result == ERR_NO_PATH)
                        logger.error("Creep can't get to location");
                }
                
            }
        }
	}
};

module.exports = roleHarvester;
var roleHarvester = {
    
    cost: 200,
    
    definition: [WORK,CARRY,MOVE],

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
	        if(typeof creep.memory.mySource == "undefined" || Game.getObjectById(creep.memory.mySource).energy == 0) {
	            var sources = creep.room.find(FIND_SOURCES, {
                    filter: function(source) {
                        return source.energy > 0;
                    }
                });
                var target = creep.pos.findClosestByPath(FIND_SOURCES, {
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
                                structure.structureType == STRUCTURE_TOWER);
                    }
            });
            if(targets.length > 0) {
                var moving = false;
                for(var x in targets) {
                    if(targets[x].energy >= targets[x].energyCapacity)
                        continue;
                    if(creep.transfer(targets[x], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[x]);
                        moving = true;
                    }
                }
                if(!moving) { // Move to the first one
                    creep.moveTo(targets[0]);
                }
                
            }
        }
	}
};

module.exports = roleHarvester;
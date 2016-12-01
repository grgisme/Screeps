var roleHarvester = require("role.harvester");

var roleBuilder = {

    cost: 200,
    type: "builder",
    
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

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }

	    if(creep.memory.building) {
	        
	        var buildingSomething = false;
	        /*
	        //Prioritize first extension
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: function(site) {
                    return site.structureType == STRUCTURE_EXTENSION;
                }
            });
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                    buildingSomething = true;
                }
            }
            */
            
            
            if(!buildingSomething) {
                var SR = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                   filter: function(object){
                       if(object.structureType != STRUCTURE_ROAD ) {
                           return false;
                       }
                       if(object.hits > object.hitsMax / 3) {
                        return false;
                      }
                       return true;
                   } 
                });
                if(SR) {
                    if(creep.repair(SR) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(SR);
                        buildingSomething = true;
                    }
                }
            }
            if(!buildingSomething) {
                //Then all else
    	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length) {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                        buildingSomething = true;
                    }
                }
            }
	        
	    }
	    else {
	        roleHarvester.run(creep);
	    }
	},
	
	stuffToBuild: function(creep) {
	    
	    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        return targets.length;
	}
};

module.exports = roleBuilder;
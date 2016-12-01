var roleHarvester = require("role.harvester");

var roleUpgrader = {

    cost: 200,
    type: "upgrader",
    
    definition: [WORK,CARRY,MOVE],
    
    definitions: [
        [WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
        [WORK,WORK,CARRY,CARRY,MOVE,MOVE],
        [WORK,WORK,CARRY,MOVE,MOVE],
        [WORK,CARRY,MOVE]
    ],
    
    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else {
            roleHarvester.run(creep);
        }
	},
	
	upgradeRequired: function(creep) {
	    if( creep.room.controller.my && (
	            (typeof creep.room.memory.needsUpgrade != "undefined" && creep.room.memory.needsUpgrade) ||
	            (creep.room.controller.level <= 1 || creep.room.controller.ticksToDowngrade < 10000)
	            )
            )
	        return true;
	    return false;
	}
};

module.exports = roleUpgrader;
var roleHarvester = require("role.harvester");

var roleBuilder = {

    cost: 200,
    
    definition: [WORK,CARRY,MOVE],
    
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
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
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
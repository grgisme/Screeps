var roleHarvester = require("role.harvester");

var roleScout = {

    cost: 200,
    type: "scout",
    
    definition: [CLAIM,WORK,CARRY,MOVE,MOVE],
    
    definitions: [
        [CLAIM,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
        [CLAIM,WORK,CARRY,CARRY,MOVE,MOVE],
        [CLAIM,WORK,CARRY,MOVE,MOVE]
    ],
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(typeof Memory.desiredRooms != "undefined" && typeof Memory.desiredRooms.length > 0) {
            var inRoom = false;
            for(var x in Memory.desiredRooms) {
                var room = Memory.desiredRooms[x];
                if(creep.room.name == room) {
                    //I'm in a properly desired room
                    inRoom = true;
                }
            }
            
            //If I'm in a legit neutral room for colonization, then colonize
            if(inRoom) {
                
            }
            else {
                //Go to a room.
                if(typeof creep.memory.destinationRoom != "undefined" && creep.memory.destinationRoom != creep.room.name) {
                    //Go to the destinationRoom
                }
                else {
                    //Set the destinationRoom
                    
                    //Go there
                }
            }
            
        }
        
            //If the controller needs captured, do that
            
            //If a spawn construction site exists, build that
            
            //Create a spawn construction site if it doesn't exist
        
        //If I'm in a room with a spawn I own, GTFO
        
        //If I'm in an enemy controlled room, GTFO
        
        //If I'm in a neutral room that's not available, GTFO
        
        //If I'm in a neutral room without a Controller or without an energy source, GTFO
        
        

/*
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
        */
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

module.exports = roleScout;
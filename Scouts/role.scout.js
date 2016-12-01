var roleHarvester = require("role.harvester");
var roleBuilder = require("role.builder");

var createNear = function(creep, location, type, range) {
        if(typeof range == "undefined")
            range = 1;
            
        var result = OK;
        
        for(var x = -range; x<= range; x++)
            for(var y = -range; y<= range; y++) {
                var result = creep.room.createConstructionSite(location.x + x, location.y + y, STRUCTURE_EXTENSION);
                if(result == OK) {
                   // this.latestCreationLocation = [location.x + x, location.y + y];
                    return result;
                }
            }
        return result;
    }

var roleScout = {

    cost: 700,
    type: "scout",
    
    definition: [CLAIM,MOVE,MOVE],
    
    definitions: [
        [CLAIM,MOVE,MOVE]
    ],
    
    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(typeof Memory.desiredRooms != "undefined" && Memory.desiredRooms.length > 0) {
            var inRoom = false;
            for(var x in Memory.desiredRooms) {
                var room = Memory.desiredRooms[x];
                if(creep.room.name == room) {
                    //If a fully built spawn exists, this room is no longer a valid scout zone
                    var spawns = creep.room.find(FIND_MY_SPAWNS);
                    if(spawns.length) {
                        Memory.desiredRooms.splice(x,1);
                    }
                    else {
                        inRoom = true;
                        break;
                    }
                }
            }
            
            //If I'm in a legit neutral room for colonization, then colonize
            if(inRoom) {
                //If the controller needs captured, do that
                if(!creep.room.controller.my) {
                    
                    var result = creep.claimController(creep.room.controller);
                    if(result == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                    else if(result == OK) {
                        //Move this room into the Pioneer List
                        if(typeof Memory.pioneerRooms == "undefined")
                            Memory.pioneerRooms = [];
                        Memory.pioneerRooms.push(creep.room.name);
                        for(var x in Memory.desiredRooms) {
                            var room = Memory.desiredRooms[x];
                            if(creep.room.name == room) {
                                Memory.desiredRooms.splice(x,1);
                                break;
                            }
                        }
                        
                        var sources = creep.room.find(FIND_SOURCES);
                        if(sources.length) {
                            var theRoom = createNear(creep, sources[0].pos, STRUCTURE_SPAWN, 10);
                        }
                    }
                }
                /*else {
                
                    //If a spawn construction site exists, build that
                    var cs = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
                        filter: function(site) {
                            return site.structureType == STRUCTURE_SPAWN;
                        }
                    });
                    if(cs.length > 0) {
                        roleBuilder.run(creep);
                    }
                    else {
                        //Grab the energy sources in the room
                        var sources = creep.room.find(FIND_SOURCES);
                        if(sources.length) {
                            var theRoom = createNear(creep, sources[0].pos, STRUCTURE_SPAWN, 10);
                            roleBuilder.run(creep);
                        }
                        
                    }
                }*/
            }
            else {
                //Go to a room.
                if(typeof creep.memory.destinationRoom != "undefined" && 
                    creep.memory.destinationRoom != creep.room.name &&
                    Game.map.isRoomAvailable(creep.memory.destinationRoom)) {
                        var route = Game.map.findRoute(creep.room, creep.memory.destinationRoom);
                        if(route.length > 0) {
                            var exit = creep.pos.findClosestByRange(route[0].exit);
                            creep.moveTo(exit);
                        }
                }
                else {
                    //Set the destinationRoom
                    for(var x in Memory.desiredRooms) {
                        creep.memory.destinationRoom = Memory.desiredRooms[x];
                        break;
                    }
                    
                    //Go there
                    var route = Game.map.findRoute(creep.room, creep.memory.destinationRoom);
                    if(route.length > 0) {
                        var exit = creep.pos.findClosestByRange(route[0].exit);
                        creep.moveTo(exit);
                    }
                }
            }
            
        }
        
            
        
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
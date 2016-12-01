/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('state.game');
 * mod.thing == 'a thing'; // true
 */
 var RoomState = require("state.room");
 var logger = require("core.logger");
 var Goals = require("strategy.goals");
 var roleScout = require("role.scout");
 
 var theGameState = function() {
        this.initialize();
 };
 
 theGameState.prototype = {
     initialize: function() {
         logger.log("Initializing GameState");
         //Grab the rooms and create instances for them.
         this.rooms = [];
         this.myRooms = [];
         for(var x in Game.rooms) {
            var room = new RoomState(Game.rooms[x], this);
             if(Game.rooms[x].controller.my) {
                this.myRooms.push(room);
             }
            this.rooms.push(room);
         }
        logger.log("Rooms: "+this.rooms.length);
        
        if(Game.gcl.level > this.myRooms.length)
            this.expandable = true;
            
        this.scouts = [];
        for(var i in Game.creeps) {
            if(Game.creeps[i].memory.role == "scout")
                this.scouts.push(Game.creeps[i]);
        }
        
        this.neededScouts = Goals.desiredScouts - this.scouts.length;
     },
     
     run: function() {
         logger.log("Running GameState");
         for(var x in this.myRooms) {
             logger.cpu();
             logger.log("Running room: "+this.myRooms[x].room.name);
            this.myRooms[x].run();
         }
         
         //Now run all scouts?
         for(var x in this.scouts) {
             roleScout.run(this.scouts[x]);
         }
     }
 };
 
module.exports = theGameState;
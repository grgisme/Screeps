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
 
 var theGameState = function() {
        this.initialize();
 };
 
 theGameState.prototype = {
     initialize: function() {
         logger.log("Initializing GameState");
         //Grab the rooms and create instances for them.
         this.rooms = [];
         for(var x in Game.rooms)
            this.rooms.push(new RoomState(Game.rooms[x]));
        logger.log("Rooms: "+this.rooms.length);
     },
     
     run: function() {
         logger.log("Running GameState");
         for(var x in this.rooms) {
             logger.log("Running room: "+this.rooms[x].room.name);
            this.rooms[x].run();
         }
     }
 };
 
module.exports = theGameState;
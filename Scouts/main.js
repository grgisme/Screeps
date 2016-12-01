var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var SPAWN_NAME = "Syntyr";
var MIN_HARVESTERS = 2;
var MIN_UPGRADERS = 1;
var MIN_BUILDERS = 1;
var GameState = require('state.game');  
var logger = require("core.logger");

module.exports.loop = function () {
    
    logger.cpu();

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            logger.log('Clearing non-existing creep memory:', name);
        }
    }
    
    logger.cpu();
    logger.log("About to initialize GameState");
    var gameState = new GameState();
    logger.log("Gamestate initialized");
    logger.cpu();
    logger.log("About to run GameState");
    gameState.run();
    logger.log("Gamestate run finished");
    logger.cpu();
}
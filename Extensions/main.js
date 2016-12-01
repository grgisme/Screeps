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

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            logger.log('Clearing non-existing creep memory:', name);
        }
    }
    
    logger.log("CPU Limit: "+Game.cpu.limit+"\nCPU Bucket: "+Game.cpu.bucket);

/*
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    console.log('Harvesters: ' + harvesters.length);

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgraders.length);

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builders.length);

    if(harvesters.length < MIN_HARVESTERS && Game.spawns[SPAWN_NAME].energy >= roleHarvester.cost) {
        var newName = Game.spawns[SPAWN_NAME].createCreep(roleHarvester.definition, undefined, {role: 'harvester'});
        console.log('Spawning new harvester: ' + newName);
    }
    else if(upgraders.length < MIN_UPGRADERS && Game.spawns[SPAWN_NAME].energy >= roleUpgrader.cost) {
        var newName = Game.spawns[SPAWN_NAME].createCreep(roleUpgrader.definition, undefined, {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }
    else if(builders.length < MIN_BUILDERS && Game.spawns[SPAWN_NAME].energy >= roleBuilder.cost) {
        var newName = Game.spawns[SPAWN_NAME].createCreep(roleBuilder.definition, undefined, {role: 'builder'});
        console.log('Spawning new builder: ' + newName);
    }
    */
    
    logger.log("About to initialize GameState");
    var gameState = new GameState();
    logger.log("About to run GameState");
    gameState.run();
    
    logger.log("CPU Used after GameState Run: "+Game.cpu.getUsed());
/*
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            if(roleUpgrader.upgradeRequired(creep))
                roleUpgrader.run(creep);
            else
                roleHarvester.run(creep);
        }
        if(creep.memory.role == 'builder') {
            if(roleBuilder.stuffToBuild(creep) > 0)
                roleBuilder.run(creep);
            else
                roleHarvester.run(creep);
        }
    }
    logger.log("CPU Used after Creeps Run: "+Game.cpu.getUsed());
    */
}
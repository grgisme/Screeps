/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('strategy.goals');
 * mod.thing == 'a thing'; // true
 */
 
 var goals = { };
 goals.desiredScouts = 0;
 
 goals.room = { };
 goals.room.infant = {
     //Room Initial Phase
     level: 3,
     creeps: {
         harvesters: 3,
         builders: 2,
         upgraders: 1
     },
     spawns: 2,
     extensions: 10,
     steps: [
         {spawns: 1, creeps: { harvesters: 2, builders: 1, upgraders: 1 }, extensions: 0, level: 1, towers: 0, roads: false, spawnRoads: true, controllerRoad: false},
         {spawns: 1, creeps: { harvesters: 2, builders: 1, upgraders: 1 }, extensions: 0, level: 2, towers: 0, roads: true, spawnRoads: true, controllerRoad: false},
         {spawns: 1, creeps: { harvesters: 2, builders: 2, upgraders: 1 }, extensions: 5, level: 2, towers: 0, roads: true, spawnRoads: true, controllerRoad: false},
         {spawns: 1, creeps: { harvesters: 2, builders: 2, upgraders: 1 }, extensions: 5, level: 2, towers: 0, roads: true, spawnRoads: true, controllerRoad: true},
         {spawns: 1, creeps: { harvesters: 3, builders: 2, upgraders: 1 }, extensions: 5, level: 3, towers: 1, roads: true, spawnRoads: true, controllerRoad: true},
         {spawns: 1, creeps: { harvesters: 3, builders: 2, upgraders: 1 }, extensions: 10, level: 3, towers: 1, roads: true, spawnRoads: true, controllerRoad: true},
         {spawns: 1, creeps: { harvesters: 3, builders: 2, upgraders: 1 }, extensions: 10, level: 4, towers: 1, roads: true, spawnRoads: true, controllerRoad: true}
     ]
 };
 goals.room.growing = {
     //Room is Healthy and Growing
     
 };
 goals.room.expand = {
     //Room is ready to expand.
     
 };
 

module.exports = goals;
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('strategy.types');
 * mod.thing == 'a thing'; // true
 */
 
 var types = { };
 types.room = { };
 
 types.room.infant = {
     name: "infant",
     owned: true,
     minSpawns: 0,
     maxSpawns: 1,
     minEnemySpawns: 0,
     maxEnemySpawns: 0,
     minLevel: 0,
     maxLevel: 4
 };
 
 types.room.growing = { 
     name: "growing",
     owned: true,
     minSpawns: 1,
     maxSpawns: 3,
     minEnemySpawns: 0,
     maxEnemySpawns: 0,
     minLevel: 4,
     maxLevel: 6
     
 };
 
 types.room.expand = {
     name: "expand",
     owned: true,
     minSpawns: 3,
     maxSpawns: 3,
     minEnemySpawns: 0,
     maxEnemySpawns: 0,
     minLevel: 3,
     maxLevel: 8
 };
 
 types.room.neutral = {
     name: "neutral",
     owned: false,
     minSpawns: 0,
     maxSpawns: 0,
     minEnemySpawns: 0,
     maxEnemySpawns: 0,
     minLevel: 0,
     maxLevel: 8,
     safe: false,
     
 };
 
 types.room.contested = {
     name: "contested",
     owned: false,
     minSpawns: 1,
     maxSpawns: 2,
     minEnemySpawns: 1,
     maxEnemySpawns: 2,
     minLevel: 0,
     maxLevel: 8,
     safe: false,
 };
 
 types.room.enemyOpen = {
     name: "enemyOpen",
     owned: false,
     minSpawns: 0,
     maxSpawns: 0,
     minEnemySpawns: 0,
     maxEnemySpawns: 2,
     minLevel: 0,
     maxLevel: 8,
     safe: false,
 };
 
 types.room.enemyClosed = {
     name: "enemyClosed",
     owned: false,
     minSpawns: 0,
     maxSpawns: 0,
     minEnemySpawns: 3,
     maxEnemySpawns: 3,
     minLevel: 0,
     maxLevel: 8,
     safe: false
 };
 
 types.room.enemySafe = {
     name: "enemySafe",
     owned: false,
     minSpawns: 0,
     maxSpawns: 0,
     minEnemySpawns: 0,
     maxEnemySpawns: 3,
     minLevel: 0,
     maxLevel: 8,
     safe: true
 };
 
 
module.exports = types;
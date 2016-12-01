/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.tower');
 * mod.thing == 'a thing'; // true
 */
 
 //noinspection JSUnresolvedFunction
var logger = require("core.logger");
 
 var tower = {
     type: "tower",
     
     run: function(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
            return true;
        }

        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function(structure) {
                if(structure.structureType == STRUCTURE_ROAD ) {
                   if(structure.hits > structure.hitsMax / 3) {
                    return false;
                   }
                }
                else if(structure.structureType == STRUCTURE_WALL) {
                    if(structure.hits > 200000)
                        return false;
                }
               return true;
            }
        });

        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
            return true;
        }

    }
 };

//noinspection JSUnresolvedVariable
module.exports = tower;
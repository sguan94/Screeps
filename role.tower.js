/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.tower');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function(tower){
        // var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        //     filter: (structure) => structure.hits < structure.hitsMax
        // });
        // if(closestDamagedStructure) {
        //     tower.repair(closestDamagedStructure);
        // }

        var damagedStructureList = tower.pos.findInRange(FIND_STRUCTURES, 50, {
            filter: (structure) => structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_ROAD
        });

        if(damagedStructureList.length != 0){
            let struct = damagedStructureList[0];
            let damage = (struct.hitsMax - struct.hits) / struct.hitsMax;

            for(let idx = 1; idx < damagedStructureList.length; idx ++){
                let tempStruct = damagedStructureList[idx];
                let tempDamage = (tempStruct.hitsMax - tempStruct.hits) / tempStruct.hitsMax;
                if(tempDamage > damage){
                    struct = tempStruct;
                    damage = tempDamage;
                }
            }

            tower.repair(struct);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
};
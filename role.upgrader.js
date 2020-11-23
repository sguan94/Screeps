/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.upgrader');
 * mod.thing == 'a thing'; // true
 */
 
function getSourceTargetID(creep){
    // return creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE).id;
    return "5bbcafc59099fc012e63b286";
};

var roleUpgrader = {
    run: function(creep){
        if(creep.memory.sourceTargetID == null){
            creep.memory.sourceTargetID = getSourceTargetID(creep);
        }
        
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
            creep.memory.sourceTargetID = getSourceTargetID(creep);
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            var sourceTarget = Game.getObjectById(creep.memory.sourceTargetID);
            if(creep.harvest(sourceTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sourceTarget, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};

module.exports = roleUpgrader;
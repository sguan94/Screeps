function getSourceTargetID(creep){
    // 矿工去哪个矿点，由路径距离决定
    let target = creep.memory.sourceTargetID = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    return target == null ? null : target.id;
};

function getStorageTargetID(creep){
    let targets = getStorageTargetList(creep);
    
    if(targets == null || targets.length == 0){
        return null;
    }else{
        // 优先填充 extension
        let extension = creep.pos.findClosestByPath(targets, {
            filter: function(structure){
                return structure.structureType == STRUCTURE_EXTENSION;
            }
        });
        if(extension != null) return extension.id;
        // 其次填充 spawn
        let spawn = creep.pos.findClosestByPath(targets, {
            filter: function(structure){
                return structure.structureType == STRUCTURE_EXTENSION;
            }
        });
        if(spawn != null) return spawn.id;
        // 最后填充 tower
        let tower = creep.pos.findClosestByPath(targets, {
            filter: function(structure){
                return structure.structureType == STRUCTURE_EXTENSION;
            }
        });
        if(tower != null) return tower.id;
        // 剩余存储点优先级由路径距离决定
        return creep.pos.findClosestByPath(targets).id;
    }
}

function getStorageTargetList(creep){
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter:(structure) => {
            return (structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_TOWER) && 
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });
    return targets;
}

/*
    三种状态：harvest，transfer，idle
    状态转移条件：
        harvest - transfer：有存储点能存放资源，并且机器人背包满了
        harvest - idle：没有存储点能存放资源
        transfer - harvest：机器人背包空了，并且有存储点能存放资源
        transfer - idle：没有存储点能存放资源
        idle - transfer：有存储点能存放资源，并且背包不为空
        ilde - harvest：有存储点能存放资源，并且背包为空
*/

var roleHarvester = {
    run: function(creep){
        let haveStorage = getStorageTargetList(creep).length != 0;
        let creepFull = creep.store.getFreeCapacity() == 0;
        let creepEmpty = creep.store.getCapacity() == creep.store.getFreeCapacity();

        switch(creep.memory.status){
            case "harvest":
                if(haveStorage && creepFull){
                    creep.say("Transfer");
                    creep.memory.status = "transfer";
                    creep.memory.storageTargetID = getStorageTargetID(creep);
                }else if(!haveStorage){
                    creep.say("HARVESTER - REST!!!!!!!!!");
                    creep.memory.status = "idle";
                }else{
                    // 采矿代码 ==================================================================
                    if(creep.memory.sourceTargetID == null){
                        creep.memory.sourceTargetID = getSourceTargetID(creep);
                    }

                    let sourceTarget = Game.getObjectById(creep.memory.sourceTargetID);
                    switch(creep.harvest(sourceTarget)){
                        case OK:
                            break;
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(sourceTarget, {visualizePathStyle: {stroke:'#ffaa00'}});
                        case ERR_INVALID_TARGET:
                            creep.memory.sourceTargetID = getStorageTargetID(creep);
                        case ERR_NOT_ENOUGH_RESOURCES:
                            creep.memory.sourceTargetID = getSourceTargetID(creep);
                    }
                }
                break;
            case "transfer":
                if(!haveStorage){
                    creep.say("HARVESTER - REST!!!!!!!!!");
                    creep.memory.status = "idle";
                }else if(haveStorage && creepEmpty){
                    creep.say("Harvest");
                    creep.memory.status = "harvest";
                    creep.memory.sourceTargetID = getSourceTargetID(creep);
                }else{
                    // 卸货代码 ===================================================================
                    if(creep.memory.storageTargetID == null){
                        creep.memory.storageTargetID = getStorageTargetID(creep);
                    }

                    let storageTarget = Game.getObjectById(creep.memory.storageTargetID);
                    switch(creep.transfer(storageTarget, RESOURCE_ENERGY)){
                        case OK:
                            break;
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(storageTarget, {visualizePathStyle: {stroke:'#ffaa00'}});
                            break;
                        case ERR_NOT_ENOUGH_RESOURCES:
                            break;
                        case ERR_INVALID_TARGET:
                            creep.memory.storageTargetID = null;
                            break;
                        case ERR_FULL:
                            creep.memory.storageTargetID = null;
                            break;
                    }
                }
                break;
            case "idle":
                if(haveStorage && creepEmpty){
                    creep.say("Harvest");
                    creep.memory.status = "harvest";
                    creep.memory.sourceTargetID = getSourceTargetID(creep);
                }else if(haveStorage && !creepEmpty){
                    creep.say("Transfer");
                    creep.memory.status = "transfer";
                    creep.memory.storageTargetID = getStorageTargetID(creep);
                }else{
                    creep.moveTo(3, 8);
                }
                break;
        }
    }
};

module.exports = roleHarvester;
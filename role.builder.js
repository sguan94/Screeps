/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.builder');
 * mod.thing == 'a thing'; // true
 */
function getSourceTargetID(creep){
    let target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    return target == null ? null: target.id;
};

function getBuildTargetID(creep){
    let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    return target == null ? null : target.id;
};
 
var roleBuilder = {
    /*
        sourceTargetID 存放资源点ID，buildTargetID 存放建筑工地ID
        三个状态：build，harvest，idle
            状态转移条件：
                build - harvest 机器人身上没有资源并且还有建筑工地需要施工
                build - idle 所有建筑工地施工完毕，没有工作了
                harvest - build 机器人装满资源，并且还有建筑工地需要施工
                harvest - idle 机器人装满资源，并且没有建筑工地需要施工
                idle - build 机器人身上有资源，并且有建筑工地需要施工
                idle - harvest 机器人身上没有资源，并且有建筑工地需要施工
    */
    run: function(creep){
        let creepEmpty = creep.store[RESOURCE_ENERGY] == 0;
        let creepFull = creep.store.getFreeCapacity() == 0;
        let haveConstructionSite = creep.room.find(FIND_CONSTRUCTION_SITES).length != 0;
        let noConstructionSite = creep.room.find(FIND_CONSTRUCTION_SITES).length == 0;
        
        switch(creep.memory.status){
            case "build":
                if(creepEmpty && haveConstructionSite){
                    creep.say('🔄 harvest');
                    creep.memory.status = "harvest";
                    creep.memory.sourceTargetID = getSourceTargetID(creep);
                }else if(noConstructionSite){
                    creep.say('REST!!!!!!!!');
                    creep.memory.status = "idle";
                }

                // 建筑代码 ==========================================================
                if(creep.memory.buildTargetID == null){
                    creep.memory.buildTargetID = getBuildTargetID(creep);
                }
                let target = Game.getObjectById(creep.memory.buildTargetID);
                if(creep.build(target) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }else if(creep.build(target) == ERR_INVALID_TARGET){
                    if(creep.room.find(FIND_CONSTRUCTION_SITES).length == 0){
                        creep.memory.status = "idle";
                    }else{
                        creep.memory.buildTargetID = getBuildTargetID(creep);
                    }
                }
                break;
            case "harvest":
                if(creepFull){
                    if(haveConstructionSite){
                        creep.say('🚧 build');
                        creep.memory.status = "build";
                        creep.memory.buildTargetID = getBuildTargetID(creep);
                    }else{
                        creep.say('REST!!!!!!!!');
                        creep.memory.status = "idle";
                    }
                }else{
                    // 采矿代码 ==========================================================
                    let source = Game.getObjectById(creep.memory.sourceTargetID);
                    if(source == null){
                        creep.memory.sourceTargetID = getSourceTargetID(creep);
                    }else{
                        if(creep.harvest(source) == ERR_NOT_IN_RANGE){
                            creep.moveTo(source, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    }

                }
                break;
            case "idle":
                if(haveConstructionSite){
                    if(creepEmpty){
                        creep.memory.status = "harvest";
                    }else{
                        creep.memory.status = "build";
                    }
                }else{
                    creep.moveTo(22, 13);
                }
                break;
            case "start":
                creep.moveTo(22, 7);
                break;
        }
    }
}

module.exports = roleBuilder;
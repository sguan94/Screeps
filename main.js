var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleTower = require('role.tower');

function spawnCreeps(spawnList){
    if(spawnList.harvester > 0){
        let name = "harvester " + Game.time;
        Game.spawns['Spawn1'].spawnCreep(
            [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 
            name, 
            {memory:{role:'harvester', status: 'harvest', storageTargetID: null, sourceTargetID: null}}
        );
        return;
    }

    if(spawnList.builder > 0){
        let name = "builder" + Game.time;
        Game.spawns['Spawn1'].spawnCreep(
            [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 
            name, 
            {memory: {role:'builder', sourceTargetID: null, buildTargetID: null, status: "harvest"}}
        );
        return;
    }

    if(spawnList.upgrader > 0){
        let name = "upgrader " + Game.time;
        Game.spawns['Spawn1'].spawnCreep(
            [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 
            name, 
            {memory: {role:'upgrader', upgrading: false, sourceTargetID: null}}
        );
    }
}

module.exports.loop = function () {
    
    // Game.rooms['E46S37'];

    // Memory 初始化阶段 ==================================================================
    for(var name in Memory.creeps){
        if(!Game.creeps[name]){
            delete Memory.creeps[name];
        }
    }

    // 自动生成机器人 =====================================================================
    let h = 4, b = 2, u = 4;
    let realH = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester').length;
    let realB = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder').length;
    let realU = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader').length;

    let spawnList = {
        harvester: h - realH,
        builder: b - realB,
        upgrader: u - realU
    }
    
    spawnCreeps(spawnList);

    // 根据机器人角色为机器人分配 module =============================================================
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }else if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }else if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }

    // 为塔分配任务 ==================================================================================
    var towerList = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER);
    for(let idx = 0; idx < towerList.length; idx ++){
        roleTower.run(towerList[idx]);
    }
}
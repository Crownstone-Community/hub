"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDb = void 0;
class MemoryDbClass {
    constructor() {
        this.stones = {};
    }
    loadCloudStoneData(stoneData) {
        let usedUIDs = {};
        Object.keys(this.stones).forEach((uid) => { usedUIDs[uid] = false; });
        // load cloud data into local data store
        stoneData.forEach((cloudStone) => {
            let uid = cloudStone.uid;
            let cloudDataUpdateTime = new Date(cloudStone.updatedAt).valueOf();
            usedUIDs[uid] = true;
            if (this.stones[uid] === undefined) {
                this.stones[uid] = {
                    name: cloudStone.name,
                    uid: cloudStone.uid,
                    locked: cloudStone.locked,
                    cloudId: cloudStone.id,
                    updatedAt: cloudDataUpdateTime,
                    switchState: null,
                    switchcraft: getAbilityData("switchcraft", cloudStone.abilities),
                    dimming: getAbilityData("dimming", cloudStone.abilities),
                    tapToToggle: getAbilityData("tapToToggle", cloudStone.abilities),
                };
            }
            else {
                if (this.stones[uid].updatedAt < cloudDataUpdateTime) {
                    this.stones[uid].name = cloudStone.name;
                    this.stones[uid].uid = cloudStone.uid;
                    this.stones[uid].locked = cloudStone.locked;
                    this.stones[uid].cloudId = cloudStone.id;
                    this.stones[uid].updatedAt = cloudDataUpdateTime;
                }
                this.stones[uid].switchcraft = getAbilityData("switchcraft", cloudStone.abilities, this.stones[uid]);
                this.stones[uid].dimming = getAbilityData("dimming", cloudStone.abilities, this.stones[uid]);
                this.stones[uid].tapToToggle = getAbilityData("tapToToggle", cloudStone.abilities, this.stones[uid]);
            }
        });
        // cleanup
        Object.keys(usedUIDs).forEach((uid) => {
            if (usedUIDs[uid] === false) {
                delete this.stones[uid];
            }
        });
    }
}
function getAbilityData(type, abilities, stoneItem) {
    for (let i = 0; i < abilities.length; i++) {
        let ability = abilities[i];
        if (ability.type === type) {
            if (stoneItem) {
                if (stoneItem.updatedAt < new Date(ability.updatedAt).valueOf()) {
                    return ability.enabled;
                }
                else {
                    return stoneItem[type];
                }
            }
            else {
                return ability.enabled;
            }
        }
    }
    return false;
}
exports.MemoryDb = new MemoryDbClass();
//# sourceMappingURL=MemoryDb.js.map
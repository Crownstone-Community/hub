"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDb = exports.fillWithStoneData = void 0;
class MemoryDbClass {
    constructor() {
        // the key of the stones is the UID, the short-uint8 id.
        this.stones = {};
        // the key of the locations is the UID, the short-uint8 id.
        this.locations = {};
    }
    loadCloudLocationData(locationData) {
        let usedUIDs = {};
        Object.keys(this.stones).forEach((uid) => { usedUIDs[uid] = false; });
        // load cloud data into local data store
        locationData.forEach((cloudLocation) => {
            let uid = cloudLocation.uid;
            let cloudDataUpdateTime = new Date(cloudLocation.updatedAt).valueOf();
            usedUIDs[uid] = true;
            if (this.locations[uid] === undefined) {
                this.locations[uid] = {
                    name: cloudLocation.name,
                    uid: cloudLocation.uid,
                    icon: cloudLocation.icon,
                    cloudId: cloudLocation.id,
                    updatedAt: cloudDataUpdateTime,
                };
            }
            else {
                if (this.locations[uid].updatedAt < cloudDataUpdateTime) {
                    this.locations[uid].name = cloudLocation.name;
                    this.locations[uid].uid = cloudLocation.uid;
                    this.locations[uid].icon = cloudLocation.icon;
                    this.locations[uid].cloudId = cloudLocation.id;
                    this.locations[uid].updatedAt = cloudDataUpdateTime;
                }
            }
        });
        // cleanup
        Object.keys(usedUIDs).forEach((uid) => {
            if (usedUIDs[uid] === false) {
                delete this.locations[uid];
            }
        });
        // fill the cloudId map
        this.locationByCloudId = {};
        Object.keys(this.locations).forEach((uid) => {
            let location = this.locations[uid];
            this.locationByCloudId[location.cloudId] = location;
        });
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
                    locationCloudId: cloudStone.locationId,
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
                    this.stones[uid].locationCloudId = cloudStone.locationId;
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
    if (abilities) {
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
    }
    return false;
}
function fillWithStoneData(uid) {
    var _a;
    let object = {};
    let stone = exports.MemoryDb.stones[uid];
    if (!stone) {
        object.name = null;
        object.locationName = null;
        object.uid = Number(uid);
        object.cloudId = null;
        return object;
    }
    let locationName = ((_a = exports.MemoryDb.locationByCloudId[stone.locationCloudId]) === null || _a === void 0 ? void 0 : _a.name) || null;
    object.name = stone.name;
    object.locationName = locationName;
    object.uid = Number(uid);
    object.cloudId = stone.cloudId;
    return object;
}
exports.fillWithStoneData = fillWithStoneData;
exports.MemoryDb = new MemoryDbClass();
//# sourceMappingURL=MemoryDb.js.map
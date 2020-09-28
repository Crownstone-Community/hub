"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchMonitor = void 0;
const DbReference_1 = require("../Data/DbReference");
const MemoryDb_1 = require("../Data/MemoryDb");
const CloudCommandHandler_1 = require("../Cloud/CloudCommandHandler");
/**
 * This class will keep an in-memory cache of the known switch-states.
 * If a switchstate that is different from the cache is received,
 * we update the state in the cloud.
 */
class SwitchMonitor {
    constructor() {
        this.lastSwitchStates = {};
    }
    collect(crownstoneUid, switchState, upload = true) {
        let switchStateConverted = Math.min(100, Math.max(switchState));
        if (switchStateConverted !== this.lastSwitchStates[crownstoneUid]) {
            DbReference_1.DbRef.switches.create({ stoneUID: crownstoneUid, switchState: switchStateConverted, timestamp: new Date() });
            this.lastSwitchStates[crownstoneUid] = switchStateConverted;
            if (MemoryDb_1.MemoryDb.stones[crownstoneUid] && upload) {
                let cloudId = MemoryDb_1.MemoryDb.stones[crownstoneUid].cloudId;
                CloudCommandHandler_1.CloudCommandHandler.addToQueue((CM) => {
                    return CM.cloud.crownstone(cloudId).setCurrentSwitchState(switchStateConverted).catch();
                });
            }
        }
    }
}
exports.SwitchMonitor = SwitchMonitor;
//# sourceMappingURL=SwitchMonitor.js.map
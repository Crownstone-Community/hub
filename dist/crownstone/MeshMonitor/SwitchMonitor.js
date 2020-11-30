"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchMonitor = void 0;
/**
 * This class will keep an in-memory cache of the known switch-states.
 * If a switchstate that is different from the cache is received,
 * we update the state in the cloud.
 */
class SwitchMonitor {
    constructor() {
        this.lastSwitchStates = {};
    }
    collect(crownstoneUid, switchState, timestamp, upload = true) {
        // let switchStateConverted = Math.min(100, Math.max(switchState));
        //
        // if (switchStateConverted !== this.lastSwitchStates[crownstoneUid]) {
        //   Dbs.switches.create({
        //     stoneUID: crownstoneUid,
        //     percentage: switchStateConverted,
        //     timestamp: new Date(Util.crownstoneTimeToTimestamp(timestamp))
        //   });
        //   this.lastSwitchStates[crownstoneUid] = switchStateConverted;
        //
        //   if (MemoryDb.stones[crownstoneUid] && upload) {
        //     let cloudId = MemoryDb.stones[crownstoneUid].cloudId;
        //     CloudCommandHandler.addToQueue((CM) => {
        //       return CM.cloud.crownstone(cloudId).setCurrentSwitchState(switchStateConverted).catch()
        //     })
        //   }
        //
        // }
    }
}
exports.SwitchMonitor = SwitchMonitor;
//# sourceMappingURL=SwitchMonitor.js.map
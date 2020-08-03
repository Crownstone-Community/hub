"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchMonitor = void 0;
const DbReference_1 = require("../Data/DbReference");
class SwitchMonitor {
    constructor() {
        this.lastSwitchStates = {};
    }
    collect(crownstoneId, switchState) {
        if (switchState !== this.lastSwitchStates[crownstoneId]) {
            DbReference_1.DbRef.switches.create({ stoneUID: crownstoneId, switchState: switchState, timestamp: new Date() });
            this.lastSwitchStates[crownstoneId] = switchState;
        }
    }
}
exports.SwitchMonitor = SwitchMonitor;
//# sourceMappingURL=SwitchMonitor.js.map
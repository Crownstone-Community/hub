"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerMonitor = void 0;
const DbReference_1 = require("../Data/DbReference");
const crownstone_core_1 = require("crownstone-core");
class PowerMonitor {
    collect(crownstoneId, powerUsageReal, powerFactor, timestamp) {
        return DbReference_1.DbRef.power.create({
            stoneUID: crownstoneId,
            powerUsage: powerUsageReal,
            powerFactor: powerFactor,
            timestamp: new Date(crownstone_core_1.Util.crownstoneTimeToTimestamp(timestamp)),
            significant: false,
            uploaded: false
        });
    }
}
exports.PowerMonitor = PowerMonitor;
//# sourceMappingURL=PowerMonitor.js.map
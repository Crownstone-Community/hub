"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerMonitor = void 0;
const DbReference_1 = require("../Data/DbReference");
class PowerMonitor {
    collect(crownstoneId, powerUsageReal, powerFactor) {
        DbReference_1.DbRef.power.create({
            stoneUID: crownstoneId, powerUsage: powerUsageReal, powerFactor: powerFactor, timestamp: new Date()
        });
    }
}
exports.PowerMonitor = PowerMonitor;
//# sourceMappingURL=PowerMonitor.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyMonitor = void 0;
const DbReference_1 = require("../Data/DbReference");
class EnergyMonitor {
    collect(crownstoneId, accumulatedEnergy) {
        DbReference_1.DbRef.energy.create({ stoneUID: crownstoneId, energyUsage: accumulatedEnergy, timestamp: new Date() });
    }
}
exports.EnergyMonitor = EnergyMonitor;
//# sourceMappingURL=EnergyMonitor.js.map
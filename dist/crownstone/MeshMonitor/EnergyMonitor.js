"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyMonitor = void 0;
const DbReference_1 = require("../Data/DbReference");
class EnergyMonitor {
    constructor(hub) {
        this.hubReference = hub;
    }
    init() {
        this.stop();
        this.timeInterval = setInterval(() => {
            this.checkForUpload().catch();
        }, 61 * 1000); // every 61 seconds.;
        // set the time initially
        this.checkForUpload().catch();
    }
    stop() {
        if (this.timeInterval) {
            clearTimeout(this.timeInterval);
        }
    }
    async checkForUpload() {
        let energyData = await DbReference_1.DbRef.energy.find({ where: { uploaded: false } });
    }
    collect(crownstoneId, accumulatedEnergy) {
        DbReference_1.DbRef.energy.create({
            stoneUID: crownstoneId,
            energyUsage: accumulatedEnergy,
            timestamp: new Date(),
            uploaded: false
        });
    }
}
exports.EnergyMonitor = EnergyMonitor;
//# sourceMappingURL=EnergyMonitor.js.map
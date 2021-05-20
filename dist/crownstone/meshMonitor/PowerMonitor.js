"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerMonitor = void 0;
const DbReference_1 = require("../data/DbReference");
const crownstone_core_1 = require("crownstone-core");
const InMemoryCache_1 = require("../data/InMemoryCache");
class PowerMonitor {
    constructor() {
        this.powerCache = new InMemoryCache_1.InMemoryCache(async (data) => { await DbReference_1.Dbs.power.createAll(data); }, 'powerMonitor');
    }
    init() {
        this.stop();
        // use this to batch the writes in the database.
        this.storeInterval = setInterval(async () => {
            await this.powerCache.store();
        }, 2000);
    }
    stop() {
        if (this.storeInterval) {
            clearInterval(this.storeInterval);
        }
    }
    collect(crownstoneId, powerUsageReal, powerFactor, timestamp) {
        return DbReference_1.Dbs.power.create({
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
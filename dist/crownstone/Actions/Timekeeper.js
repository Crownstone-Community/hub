"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timekeeper = void 0;
const Logger_1 = require("../../Logger");
const crownstone_core_1 = require("crownstone-core");
const log = Logger_1.Logger(__filename);
class Timekeeper {
    constructor(hub) {
        this.hubReference = hub;
    }
    init() {
        this.stop();
        this.timeInterval = setInterval(() => {
            this.setTime();
        }, 30 * 60 * 1000); // every 30 minutes;
        // set the time initially
        this.setTime();
    }
    async setTime() {
        try {
            await this.hubReference.uart.connection.control.setTime(crownstone_core_1.Util.nowToCrownstoneTime());
        }
        catch (e) {
            log.warn("Error when trying to set time", e);
        }
    }
    stop() {
        if (this.timeInterval) {
            clearTimeout(this.timeInterval);
        }
    }
}
exports.Timekeeper = Timekeeper;
//# sourceMappingURL=Timekeeper.js.map
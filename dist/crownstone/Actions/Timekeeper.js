"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timekeeper = void 0;
const LOG = require('debug-level')('crownstone-hub-cloud-timekeeper');
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
            await this.hubReference.uart.uart.setTime();
        }
        catch (e) {
            LOG.warn("Error when trying to set time", e);
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
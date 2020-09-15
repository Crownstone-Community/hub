"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timekeeper = void 0;
class Timekeeper {
    constructor(hub) {
        this.hubReference = hub;
    }
    init() {
        this.stop();
        this.timeInterval = setInterval(() => {
            this.action();
        }, 30 * 60 * 1000); // every 30 minutes;
        // set the time initially
        this.action();
    }
    action() {
        // TODO: set time;
    }
    stop() {
        if (this.timeInterval) {
            clearTimeout(this.timeInterval);
        }
    }
}
exports.Timekeeper = Timekeeper;
//# sourceMappingURL=Timekeeper.js.map
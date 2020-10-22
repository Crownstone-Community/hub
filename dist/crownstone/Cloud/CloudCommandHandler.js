"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudCommandHandler = void 0;
const Util_1 = require("../../util/Util");
class CloudCommandHandlerClass {
    constructor() {
        this.queue = [];
        this.iterating = false;
    }
    async iterate() {
        if (!this.iterating && this.manager && this.manager.initialized) {
            this.iterating = true;
            await this.iterateStep();
            this.iterating = false;
        }
    }
    async iterateStep() {
        if (this.queue.length > 0) {
            try {
                await this.queue[0](this.manager);
            }
            catch (e) { }
            this.queue.splice(0, 1);
            await Util_1.Util.wait(250);
            this.iterateStep();
        }
    }
    loadManager(manager) {
        this.manager = manager;
    }
    addToQueue(cloudCall) {
        this.queue.push(cloudCall);
        this.iterate();
    }
}
exports.CloudCommandHandler = new CloudCommandHandlerClass();
//# sourceMappingURL=CloudCommandHandler.js.map
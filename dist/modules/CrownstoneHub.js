"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrownstoneHub = void 0;
const Uart_1 = require("./Uart/Uart");
const CloudManager_1 = require("./Cloud/CloudManager");
class CrownstoneHubClass {
    constructor() {
        this.launched = false;
        this.uart = new Uart_1.Uart();
        this.cloud = new CloudManager_1.CloudManager();
    }
    async initialize() {
        console.log("Launching Modules");
        if (this.launched === false) {
            // execute modules
            await this.uart.initialize();
            console.log("Uart initialized");
            await this.cloud.initialize();
            console.log("Cloud initialized");
            this.launched = true;
        }
    }
}
exports.CrownstoneHub = new CrownstoneHubClass();
//# sourceMappingURL=CrownstoneHub.js.map
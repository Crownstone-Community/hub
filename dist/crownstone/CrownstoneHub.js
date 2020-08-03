"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrownstoneHub = void 0;
const Uart_1 = require("./Uart/Uart");
const CloudManager_1 = require("./Cloud/CloudManager");
const DbReference_1 = require("./Data/DbReference");
const MeshMonitor_1 = require("./MeshMonitor/MeshMonitor");
const LOG = require('debug-level')('crownstone-hub-base');
class CrownstoneHubClass {
    constructor() {
        this.launched = false;
        this.uart = new Uart_1.Uart();
        this.cloud = new CloudManager_1.CloudManager();
        this.mesh = new MeshMonitor_1.MeshMonitor();
    }
    async initialize() {
        LOG.info("Launching Modules");
        if (this.launched === false) {
            // execute modules
            await this.uart.initialize();
            LOG.info("Uart initialized");
            await this.cloud.initialize();
            LOG.info("Cloud initialized");
            this.launched = true;
        }
    }
    async cleanupAndDestroy() {
        await exports.CrownstoneHub.cloud.cleanup();
        await DbReference_1.DbRef.hub.deleteAll();
        await DbReference_1.DbRef.user.deleteAll();
        await DbReference_1.DbRef.power.deleteAll();
        await DbReference_1.DbRef.energy.deleteAll();
    }
}
exports.CrownstoneHub = new CrownstoneHubClass();
//# sourceMappingURL=CrownstoneHub.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrownstoneHub = exports.CrownstoneHubClass = void 0;
const Uart_1 = require("./Uart/Uart");
const CloudManager_1 = require("./Cloud/CloudManager");
const DbReference_1 = require("./Data/DbReference");
const MeshMonitor_1 = require("./MeshMonitor/MeshMonitor");
const CloudCommandHandler_1 = require("./Cloud/CloudCommandHandler");
const Timekeeper_1 = require("./Actions/Timekeeper");
const Logger_1 = require("../Logger");
const log = Logger_1.Logger(__filename);
class CrownstoneHubClass {
    constructor() {
        this.launched = false;
        this.cloud = new CloudManager_1.CloudManager();
        this.uart = new Uart_1.Uart();
        this.mesh = new MeshMonitor_1.MeshMonitor(this);
        this.timeKeeper = new Timekeeper_1.Timekeeper(this);
        CloudCommandHandler_1.CloudCommandHandler.loadManager(this.cloud);
    }
    async initialize() {
        let hub = await DbReference_1.DbRef.hub.get();
        if (hub) {
            log.info("Launching Modules");
            if (this.launched === false) {
                // execute modules
                await this.cloud.initialize();
                log.info("Cloud initialized");
                await this.uart.initialize();
                log.info("Uart initialized");
                this.mesh.init();
                this.timeKeeper.init();
                this.launched = true;
            }
        }
        else {
            log.info("Hub not configured yet.");
        }
    }
    async cleanupAndDestroy() {
        await this.mesh.cleanup();
        await this.timeKeeper.stop();
        await exports.CrownstoneHub.cloud.cleanup();
        await DbReference_1.DbRef.hub.deleteAll();
        await DbReference_1.DbRef.user.deleteAll();
        await DbReference_1.DbRef.power.deleteAll();
        await DbReference_1.DbRef.energy.deleteAll();
        await DbReference_1.DbRef.energyProcessed.deleteAll();
    }
}
exports.CrownstoneHubClass = CrownstoneHubClass;
exports.CrownstoneHub = new CrownstoneHubClass();
//# sourceMappingURL=CrownstoneHub.js.map
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
const HubStatus_1 = require("./HubStatus");
const HubEventBus_1 = require("./HubEventBus");
const topics_1 = require("./topics");
const log = Logger_1.Logger(__filename);
class CrownstoneHubClass {
    constructor() {
        this.launched = false;
        this.cloud = new CloudManager_1.CloudManager();
        this.uart = new Uart_1.Uart();
        this.mesh = new MeshMonitor_1.MeshMonitor(this);
        this.timeKeeper = new Timekeeper_1.Timekeeper(this);
        CloudCommandHandler_1.CloudCommandHandler.loadManager(this.cloud);
        HubEventBus_1.eventBus.on(topics_1.topics.HUB_CREATED, () => { this.initialize(); });
    }
    async initialize() {
        HubStatus_1.resetHubStatus();
        let hub = await DbReference_1.DbRef.hub.get();
        if (hub && hub.id) {
            log.info("Launching Modules");
            if (this.launched === false) {
                // execute modules
                try {
                    await this.cloud.initialize();
                    log.info("Cloud initialized");
                    await this.uart.initialize();
                    log.info("Uart initialized");
                    HubStatus_1.HubStatus.uartReady = true;
                    this.mesh.init();
                    this.timeKeeper.init();
                    this.launched = true;
                    HubStatus_1.HubStatus.initialized = true;
                }
                catch (e) {
                    if (e === 401) {
                        log.info("Initialization failed. Cloud could not authenticate hub.");
                    }
                    else {
                        log.info("Initialization failed", e);
                    }
                }
            }
        }
        else {
            log.info("Hub not configured yet.");
        }
        HubStatus_1.HubStatus.hasSphereCached = await DbReference_1.DbRef.hub.isSphereSet();
    }
    async cleanupAndDestroy() {
        await this.mesh.cleanup();
        await this.timeKeeper.stop();
        await exports.CrownstoneHub.cloud.cleanup();
        await DbReference_1.EMPTY_DATABASE();
    }
}
exports.CrownstoneHubClass = CrownstoneHubClass;
exports.CrownstoneHub = new CrownstoneHubClass();
//# sourceMappingURL=CrownstoneHub.js.map
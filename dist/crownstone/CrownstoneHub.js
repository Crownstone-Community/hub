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
const CrownstoneUtil_1 = require("./CrownstoneUtil");
const config_1 = require("../config");
const DbUtil_1 = require("./Data/DbUtil");
const HubStatusManager_1 = require("./Uart/HubStatusManager");
const log = Logger_1.Logger(__filename);
class CrownstoneHubClass {
    constructor() {
        this.cloud = new CloudManager_1.CloudManager();
        this.uart = new Uart_1.Uart(this.cloud.cloud);
        this.mesh = new MeshMonitor_1.MeshMonitor();
        this.timeKeeper = new Timekeeper_1.Timekeeper(this);
        CloudCommandHandler_1.CloudCommandHandler.loadManager(this.cloud);
        HubEventBus_1.eventBus.on(topics_1.topics.HUB_CREATED, () => { this.initialize(); });
        if (config_1.CONFIG.enableUart) {
            this.uart.initialize();
            log.info("Uart initialized");
        }
        HubStatus_1.HubStatus.uartReady = true;
    }
    async initialize() {
        HubStatus_1.resetHubStatus();
        let hub = await DbReference_1.Dbs.hub.get();
        if (hub && hub.cloudId !== 'null') {
            log.info("Launching Modules");
            clearInterval(this.linkedStoneCheckInterval);
            clearInterval(this.setStatusBackupInterval);
            this.linkedStoneCheckInterval = setInterval(() => { CrownstoneUtil_1.CrownstoneUtil.checkLinkedStoneId(); }, 30 * 60 * 1000);
            this.setStatusBackupInterval = setInterval(() => { HubStatusManager_1.HubStatusManager.setActualStatus(); }, 5 * 60 * 1000);
            // load the key if we already have it.
            if (hub.uartKey) {
                this.uart.connection.encryption.setKey(hub.uartKey);
                HubStatusManager_1.HubStatusManager.setStatus({ clientHasBeenSetup: true });
            }
            try {
                await this.cloud.initialize();
                log.info("Cloud initialized");
                log.info("Checking linked StoneId");
                await CrownstoneUtil_1.CrownstoneUtil.checkLinkedStoneId();
                log.info("Checked linked StoneId.");
                try {
                    log.info("Setting up UART encryption...");
                    await this.uart.refreshUartEncryption();
                    log.info("UART key loaded.");
                }
                catch (e) {
                    log.warn("Could not obtain connection key.");
                }
                this.mesh.init();
                this.timeKeeper.init();
                HubStatus_1.HubStatus.initialized = true;
                await HubStatusManager_1.HubStatusManager.setStatus({
                    clientHasBeenSetup: true,
                    encryptionRequired: true,
                    clientHasInternet: true,
                });
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
        else {
            log.info("Hub not configured yet.");
        }
        hub = await DbReference_1.Dbs.hub.get();
        HubStatus_1.HubStatus.belongsToSphere = (hub === null || hub === void 0 ? void 0 : hub.sphereId) || "none";
    }
    async cleanupAndDestroy(partial = false) {
        clearInterval(this.linkedStoneCheckInterval);
        this.uart.connection.encryption.removeKey();
        HubStatusManager_1.HubStatusManager.setStatus({ clientHasBeenSetup: false });
        await this.mesh.cleanup();
        await this.timeKeeper.stop();
        await exports.CrownstoneHub.cloud.cleanup();
        if (partial) {
            console.log("Crippling hub instance...");
            await DbReference_1.Dbs.hub.partialDelete();
            console.log("Crippling hub instance. DONE!");
        }
        else {
            console.log("Deleting hub database...");
            await DbUtil_1.EMPTY_DATABASE();
            console.log("Deleting hub database. DONE!");
        }
    }
}
exports.CrownstoneHubClass = CrownstoneHubClass;
exports.CrownstoneHub = new CrownstoneHubClass();
//# sourceMappingURL=CrownstoneHub.js.map
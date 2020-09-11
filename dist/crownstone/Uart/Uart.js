"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uart = void 0;
const crownstone_uart_1 = require("crownstone-uart");
const PromiseManager_1 = require("./PromiseManager");
const EventBus_1 = require("../EventBus");
const config_1 = require("../../config");
const topics_1 = require("../topics");
const LOG = require('debug-level')('crownstone-uart-bridge');
class Uart {
    constructor() {
        this.ready = false;
        this.queue = new PromiseManager_1.PromiseManager();
        this.uart = new crownstone_uart_1.CrownstoneUart();
        this.forwardEvents();
    }
    forwardEvents() {
        // generate a list of topics that can be remapped from uart to lib.
        let eventsToForward = [
            { uartTopic: "MeshServiceData", moduleTopic: topics_1.topics.MESH_SERVICE_DATA },
        ];
        // forward all required events to the module eventbus.
        eventsToForward.forEach((event) => {
            let moduleEvent = event.moduleTopic;
            if (!event.moduleTopic) {
                moduleEvent = event.uartTopic;
            }
            this.uart.on(event.uartTopic, (data) => { EventBus_1.eventBus.emit(moduleEvent, data); });
        });
    }
    async initialize() {
        try {
            await this.uart.start(config_1.CONFIG.uartPort);
            LOG.info("Uart is ready");
            this.ready = true;
        }
        catch (err) {
            this.ready = false;
            throw err;
        }
    }
    async switchCrownstones(switchPairs) {
        if (!this.ready) {
            throw "NOT_READY";
        }
        return this.queue.register(() => {
            LOG.info("Dispatching switchAction", switchPairs);
            return this.uart.switchCrownstones(switchPairs);
        });
    }
    registerTrackedDevice(trackingNumber, locationUID, profileId, rssiOffset, ignoreForPresence, tapToToggleEnabled, deviceToken, ttlMinutes) {
        if (!this.ready) {
            throw "NOT_READY";
        }
        this.queue.register(() => {
            return this.uart.registerTrackedDevice(trackingNumber, locationUID, profileId, rssiOffset, ignoreForPresence, tapToToggleEnabled, deviceToken, ttlMinutes);
        });
    }
}
exports.Uart = Uart;
//# sourceMappingURL=Uart.js.map
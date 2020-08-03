"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bridge = void 0;
const crownstone_uart_1 = require("crownstone-uart");
const PromiseManager_1 = require("./PromiseManager");
const dist_1 = require("crownstone-sse/dist");
const log = require('debug-level')('bridge');
class Bridge {
    constructor(eventBus) {
        this.ready = false;
        this.queue = new PromiseManager_1.PromiseManager();
        this.uart = new crownstone_uart_1.CrownstoneUart();
        this.sse = new dist_1.CrownstoneSSE();
        this.eventBus = eventBus;
        this.forwardEvents();
    }
    forwardEvents() {
        // generate a list of topics that can be remapped from uart to lib.
        let eventsToForward = [
            { bluenetTopic: "MeshServiceData", moduleTopic: "MeshServiceData" },
        ];
        // forward all required events to the module eventbus.
        eventsToForward.forEach((event) => {
            let moduleEvent = event.moduleTopic;
            if (!event.moduleTopic) {
                moduleEvent = event.bluenetTopic;
            }
            this.uart.on(event.bluenetTopic, (data) => { this.eventBus.emit(moduleEvent, data); });
        });
    }
    async login(token) {
        this.sse.setAccessToken(token);
        await this.sse.start((data) => { this._sseEventHandler(data); });
    }
    _sseEventHandler(data) {
    }
    async initialize() {
        try {
            await this.uart.start();
            log.info("Uart is ready");
            this.ready = true;
        }
        catch (err) {
            this.ready = false;
            throw err;
        }
    }
    switchCrownstones(switchPairs) {
        if (!this.ready) {
            throw "NOT_READY";
        }
        this.queue.register(() => {
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
exports.Bridge = Bridge;
//# sourceMappingURL=Bridge.js.map
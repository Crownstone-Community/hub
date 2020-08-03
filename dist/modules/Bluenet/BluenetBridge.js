"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BluenetBridge = void 0;
const ModuleBaseClass_1 = require("../ModuleBaseClass");
const bluenet_nodejs_lib_uart_1 = require("bluenet-nodejs-lib-uart");
const PromiseManager_1 = require("./PromiseManager");
class BluenetBridge extends ModuleBaseClass_1.ModuleBase {
    constructor(eventBus) {
        super(eventBus);
        this.ready = false;
        this.queue = new PromiseManager_1.PromiseManager();
        this.bluenet = new bluenet_nodejs_lib_uart_1.BluenetUart();
        this.forwardEvents();
    }
    forwardEvents() {
        // generate a list of topics that can be remapped from bluenet to lib.
        let eventsToForward = [
            { bluenetTopic: "MeshServiceData", moduleTopic: "MeshServiceData" },
        ];
        // forward all required events to the module eventbus.
        eventsToForward.forEach((event) => {
            let moduleEvent = event.moduleTopic;
            if (!event.moduleTopic) {
                moduleEvent = event.bluenetTopic;
            }
            this.bluenet.on(event.bluenetTopic, (data) => { this.eventBus.emit(moduleEvent, data); });
        });
    }
    async initialize() {
        try {
            await this.bluenet.start();
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
            return this.bluenet.switchCrownstones(switchPairs);
        });
    }
    registerTrackedDevice(trackingNumber, locationUID, profileId, rssiOffset, ignoreForPresence, tapToToggleEnabled, deviceToken, ttlMinutes) {
        if (!this.ready) {
            throw "NOT_READY";
        }
        this.queue.register(() => {
            return this.bluenet.registerTrackedDevice(trackingNumber, locationUID, profileId, rssiOffset, ignoreForPresence, tapToToggleEnabled, deviceToken, ttlMinutes);
        });
    }
}
exports.BluenetBridge = BluenetBridge;
//# sourceMappingURL=BluenetBridge.js.map
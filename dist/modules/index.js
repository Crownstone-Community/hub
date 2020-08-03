"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchModules = exports.Modules = void 0;
const EventBus_1 = require("./EventBus");
const MeshMonitor_1 = require("./MeshMonitor/MeshMonitor");
const Bridge_1 = require("./Crownstone/Bridge");
let launched = false;
const eventBus = new EventBus_1.EventBusClass();
exports.Modules = {
    uart: new Bridge_1.Bridge(eventBus),
    meshMonitor: new MeshMonitor_1.MeshMonitor(eventBus),
    eventBus: eventBus,
};
async function LaunchModules() {
    console.log("Launching Modules");
    if (launched === false) {
        // execute modules
        await exports.Modules.uart.initialize();
        // await Modules.meshMonitor.initialize();
        launched = true;
    }
}
exports.LaunchModules = LaunchModules;
async function openUartConnection() {
}
//# sourceMappingURL=index.js.map
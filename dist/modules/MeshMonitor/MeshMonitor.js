"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshMonitor = void 0;
const ModuleBaseClass_1 = require("../ModuleBaseClass");
class MeshMonitor extends ModuleBaseClass_1.ModuleBase {
    constructor() {
        super(...arguments);
        this.topology = { nodes: [], edges: [] };
    }
    initialize() {
        this.eventBus.on("MeshServiceData", this._handleServiceData.bind(this));
        return Promise.resolve();
    }
    _handleServiceData(serviceData) {
        console.log("I got serviceData", serviceData);
    }
}
exports.MeshMonitor = MeshMonitor;
//# sourceMappingURL=MeshMonitor.js.map
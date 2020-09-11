"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopologyMonitor = void 0;
class TopologyMonitor {
    constructor() {
        this.crownstonesInMesh = {};
    }
    collect(crownstoneId) {
        this.crownstonesInMesh[crownstoneId] = Date.now();
    }
}
exports.TopologyMonitor = TopologyMonitor;
//# sourceMappingURL=TopologyMonitor.js.map
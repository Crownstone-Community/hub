"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshMonitor = void 0;
const PowerMonitor_1 = require("./PowerMonitor");
const EnergyMonitor_1 = require("./EnergyMonitor");
const TopologyMonitor_1 = require("./TopologyMonitor");
const SwitchMonitor_1 = require("./SwitchMonitor");
const LOG = require('debug-level')('crownstone-hub-mesh-monitor');
class MeshMonitor {
    constructor() {
        this.eventsRegistered = false;
        this.power = new PowerMonitor_1.PowerMonitor();
        this.energy = new EnergyMonitor_1.EnergyMonitor();
        this.switch = new SwitchMonitor_1.SwitchMonitor();
        this.topology = new TopologyMonitor_1.TopologyMonitor();
        this.setupEvents();
    }
    setupEvents() {
        if (this.eventsRegistered === false) {
            // eventBus.on(topics.MESH_SERVICE_DATA, (data: ServiceDataJson) => { this.gather(data); });
            this.eventsRegistered = true;
        }
    }
    gather(data) {
        let crownstoneUid = data.crownstoneId; // the id in the advertisement is the short-uid
        LOG.debug("Received data from", crownstoneUid);
        this.power.collect(crownstoneUid, data.powerUsageReal, data.powerFactor);
        this.energy.collect(crownstoneUid, data.accumulatedEnergy);
        this.switch.collect(crownstoneUid, data.switchState);
        this.topology.collect(crownstoneUid);
    }
}
exports.MeshMonitor = MeshMonitor;
//# sourceMappingURL=MeshMonitor.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshMonitor = void 0;
const PowerMonitor_1 = require("./PowerMonitor");
const EnergyMonitor_1 = require("./EnergyMonitor");
const TopologyMonitor_1 = require("./TopologyMonitor");
const SwitchMonitor_1 = require("./SwitchMonitor");
const EventBus_1 = require("../EventBus");
const topics_1 = require("../topics");
const LOG = require('debug-level')('crownstone-hub-mesh-monitor');
class MeshMonitor {
    constructor(hub) {
        this.eventsRegistered = false;
        this.hubReference = hub;
        this.power = new PowerMonitor_1.PowerMonitor();
        this.energy = new EnergyMonitor_1.EnergyMonitor(this.hubReference);
        this.switch = new SwitchMonitor_1.SwitchMonitor();
        this.topology = new TopologyMonitor_1.TopologyMonitor();
        this.setupEvents();
    }
    init() {
        this.energy.init();
    }
    cleanup() {
        this.energy.stop();
    }
    setupEvents() {
        if (this.eventsRegistered === false) {
            EventBus_1.eventBus.on(topics_1.topics.MESH_SERVICE_DATA, (data) => { this.gather(data); });
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
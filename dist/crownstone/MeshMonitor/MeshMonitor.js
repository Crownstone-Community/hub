"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshMonitor = void 0;
const PowerMonitor_1 = require("./PowerMonitor");
const EnergyMonitor_1 = require("./EnergyMonitor");
const TopologyMonitor_1 = require("./TopologyMonitor");
const SwitchMonitor_1 = require("./SwitchMonitor");
const HubEventBus_1 = require("../HubEventBus");
const topics_1 = require("../topics");
const Logger_1 = require("../../Logger");
const log = Logger_1.Logger(__filename);
class MeshMonitor {
    constructor() {
        this.eventsRegistered = false;
        this.power = new PowerMonitor_1.PowerMonitor();
        this.energy = new EnergyMonitor_1.EnergyMonitor();
        this.switch = new SwitchMonitor_1.SwitchMonitor();
        this.topology = new TopologyMonitor_1.TopologyMonitor();
    }
    init() {
        this.energy.init();
        this.power.init();
        this.setupEvents();
    }
    cleanup() {
        this.unsubscribeEventListener();
        this.energy.stop();
        this.power.stop();
    }
    setupEvents() {
        if (this.eventsRegistered === false) {
            this.unsubscribeEventListener = HubEventBus_1.eventBus.on(topics_1.topics.MESH_SERVICE_DATA, (data) => { this.gather(data); });
            this.eventsRegistered = true;
        }
    }
    gather(data) {
        let crownstoneUid = data.crownstoneId; // the id in the advertisement is the short-uid
        log.debug("Received data from", crownstoneUid);
        this.power.collect(crownstoneUid, data.powerUsageReal, data.powerFactor, data.timestamp);
        this.energy.collect(crownstoneUid, data.accumulatedEnergy, data.powerUsageReal, data.timestamp);
        this.switch.collect(crownstoneUid, data.switchState, data.timestamp);
        this.topology.collect(crownstoneUid);
    }
}
exports.MeshMonitor = MeshMonitor;
//# sourceMappingURL=MeshMonitor.js.map
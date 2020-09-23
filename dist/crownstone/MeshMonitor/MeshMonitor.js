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
        this.unsubscribeEventListener();
        this.energy.stop();
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
        this.power.collect(crownstoneUid, data.powerUsageReal, data.powerFactor);
        this.energy.collect(crownstoneUid, data.accumulatedEnergy, data.powerUsageReal);
        this.switch.collect(crownstoneUid, data.switchState);
        this.topology.collect(crownstoneUid);
    }
}
exports.MeshMonitor = MeshMonitor;
//# sourceMappingURL=MeshMonitor.js.map
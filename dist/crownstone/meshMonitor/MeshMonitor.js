"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshMonitor = void 0;
const PowerMonitor_1 = require("./PowerMonitor");
const EnergyMonitor_1 = require("./EnergyMonitor");
const NetworkMonitor_1 = require("./NetworkMonitor");
const SwitchMonitor_1 = require("./SwitchMonitor");
const HubEventBus_1 = require("../HubEventBus");
const topics_1 = require("../topics");
const Logger_1 = require("../../Logger");
const log = Logger_1.Logger(__filename);
class MeshMonitor {
    constructor() {
        this.eventsRegistered = false;
        this.unsubscribeEventListeners = [];
        this.power = new PowerMonitor_1.PowerMonitor();
        this.energy = new EnergyMonitor_1.EnergyMonitor();
        this.switch = new SwitchMonitor_1.SwitchMonitor();
        this.network = new NetworkMonitor_1.NetworkMonitor();
    }
    init() {
        this.cleanup();
        this.energy.init();
        this.power.init();
        this.setupEvents();
    }
    cleanup() {
        this.unsubscribeEventListeners.forEach((unsub) => { unsub(); });
        this.unsubscribeEventListeners = [];
        this.energy.stop();
        this.power.stop();
        this.eventsRegistered = false;
    }
    setupEvents() {
        if (this.eventsRegistered === false) {
            this.unsubscribeEventListeners.push(HubEventBus_1.eventBus.on(topics_1.topics.MESH_SERVICE_DATA, (data) => { this.gather(data); }));
            this.unsubscribeEventListeners.push(HubEventBus_1.eventBus.on(topics_1.topics.MESH_TOPOLOGY, (data) => { this.network.updateTopology(data); }));
            this.eventsRegistered = true;
        }
    }
    gather(data) {
        let crownstoneUid = data.crownstoneId; // the id in the advertisement is the short-uid
        log.debug("Received data from", crownstoneUid);
        this.network.updateLastSeen(crownstoneUid);
        if (data.timeIsSet) {
            this.switch.collect(crownstoneUid, data.switchState, data.timestamp);
            this.power.collect(crownstoneUid, data.powerUsageReal, data.powerFactor, data.timestamp);
            this.energy.collect(crownstoneUid, data.accumulatedEnergy, data.powerUsageReal, data.timestamp);
        }
        else {
            log.debug("Ignoring data from", crownstoneUid, " for switch, energy and power measurement because time is not set.");
        }
    }
}
exports.MeshMonitor = MeshMonitor;
//# sourceMappingURL=MeshMonitor.js.map
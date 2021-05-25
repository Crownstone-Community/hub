import { PowerMonitor }    from './PowerMonitor';
import { EnergyMonitor }   from './EnergyMonitor';
import { NetworkMonitor } from './NetworkMonitor';
import { SwitchMonitor }   from './SwitchMonitor';
import {eventBus} from '../HubEventBus';
import {topics} from '../topics';
import {Logger} from '../../Logger';
const log = Logger(__filename);


type callback = () => void;
export class MeshMonitor {
  eventsRegistered = false;
  unsubscribeEventListeners : callback[] = [];

  power:    PowerMonitor;
  energy:   EnergyMonitor;
  switch:   SwitchMonitor;
  network:  NetworkMonitor;

  constructor() {
    this.power    = new PowerMonitor();
    this.energy   = new EnergyMonitor();
    this.switch   = new SwitchMonitor();
    this.network  = new NetworkMonitor();
  }

  init() {
    this.cleanup();
    this.energy.init();
    this.power.init();
    this.setupEvents();
  }

  cleanup() {
    this.unsubscribeEventListeners.forEach((unsub) => { unsub()});
    this.unsubscribeEventListeners = [];
    this.energy.stop();
    this.power.stop();
    this.eventsRegistered = false;
  }

  setupEvents() {
    if (this.eventsRegistered === false) {
      this.unsubscribeEventListeners.push(eventBus.on(topics.MESH_SERVICE_DATA, (data: ServiceDataJson) => { this.gather(data); }));
      this.unsubscribeEventListeners.push(eventBus.on(topics.MESH_TOPOLOGY,     (data: TopologyUpdateData) => { this.network.updateTopology(data); }));
      this.eventsRegistered = true;
    }
  }

  gather(data: ServiceDataJson) {
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
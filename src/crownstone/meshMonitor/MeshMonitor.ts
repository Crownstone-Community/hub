import { PowerMonitor }    from './PowerMonitor';
import { EnergyMonitor }   from './EnergyMonitor';
import { TopologyMonitor } from './TopologyMonitor';
import { SwitchMonitor }   from './SwitchMonitor';
import {eventBus} from '../HubEventBus';
import {topics} from '../topics';
import {Logger} from '../../Logger';
const log = Logger(__filename);

export class MeshMonitor {
  eventsRegistered = false;
  unsubscribeEventListener : () => void = () => {};

  power:    PowerMonitor;
  energy:   EnergyMonitor;
  switch:   SwitchMonitor;
  topology: TopologyMonitor;

  constructor() {
    this.power    = new PowerMonitor();
    this.energy   = new EnergyMonitor();
    this.switch   = new SwitchMonitor();
    this.topology = new TopologyMonitor();
  }

  init() {
    this.cleanup();
    this.energy.init();
    this.power.init();
    this.setupEvents();
  }

  cleanup() {
    this.unsubscribeEventListener();
    this.energy.stop();
    this.power.stop();
    this.eventsRegistered = false;
  }

  setupEvents() {
    if (this.eventsRegistered === false) {
      this.unsubscribeEventListener = eventBus.on(topics.MESH_SERVICE_DATA, (data: ServiceDataJson) => { this.gather(data); });
      this.eventsRegistered = true;
    }
  }

  gather(data: ServiceDataJson) {
    let crownstoneUid = data.crownstoneId; // the id in the advertisement is the short-uid
    log.debug("Received data from", crownstoneUid);
    this.topology.collect(crownstoneUid);

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
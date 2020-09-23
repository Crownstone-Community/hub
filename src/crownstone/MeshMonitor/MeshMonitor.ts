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
  unsubscribeEventListener : () => void;

  power:    PowerMonitor;
  energy:   EnergyMonitor;
  switch:   SwitchMonitor;
  topology: TopologyMonitor;

  hubReference: CrownstoneHub

  constructor(hub : CrownstoneHub) {
    this.hubReference = hub;

    this.power    = new PowerMonitor();
    this.energy   = new EnergyMonitor(this.hubReference);
    this.switch   = new SwitchMonitor();
    this.topology = new TopologyMonitor();

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
      this.unsubscribeEventListener = eventBus.on(topics.MESH_SERVICE_DATA, (data: ServiceDataJson) => { this.gather(data); });
      this.eventsRegistered = true;
    }
  }

  gather(data: ServiceDataJson) {
    let crownstoneUid = data.crownstoneId; // the id in the advertisement is the short-uid
    log.debug("Received data from", crownstoneUid)

    this.power.collect(crownstoneUid, data.powerUsageReal, data.powerFactor);
    this.energy.collect(crownstoneUid, data.accumulatedEnergy, data.powerUsageReal);
    this.switch.collect(crownstoneUid, data.switchState);
    this.topology.collect(crownstoneUid);
  }
} 
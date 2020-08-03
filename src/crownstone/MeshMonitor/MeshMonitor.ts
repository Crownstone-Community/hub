import {eventBus} from '../EventBus';
import {topics} from '../topics';
import {PowerMonitor} from './PowerMonitor';
import {EnergyMonitor} from './EnergyMonitor';
import {TopologyMonitor} from './TopologyMonitor';
import {SwitchMonitor} from './SwitchMonitor';
const LOG = require('debug-level')('crownstone-hub-mesh-monitor')

export class MeshMonitor {
  eventsRegistered = false;

  power:    PowerMonitor;
  energy:   EnergyMonitor;
  switch:   SwitchMonitor;
  topology: TopologyMonitor;




  constructor() {
    this.power    = new PowerMonitor();
    this.energy   = new EnergyMonitor();
    this.switch   = new SwitchMonitor();
    this.topology = new TopologyMonitor();

    this.setupEvents();
  }


  setupEvents() {
    if (this.eventsRegistered === false) {
      // eventBus.on(topics.MESH_SERVICE_DATA, (data: ServiceDataJson) => { this.gather(data); });
      this.eventsRegistered = true;
    }
  }

  gather(data: ServiceDataJson) {
    let crownstoneId = data.crownstoneId;
    LOG.debug("Received data from", crownstoneId)
    this.power.collect(crownstoneId, data.powerUsageReal, data.powerFactor);
    this.energy.collect(crownstoneId, data.accumulatedEnergy);
    this.switch.collect(crownstoneId, data.switchState);
    this.topology.collect(crownstoneId);
  }
} 
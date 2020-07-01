import {Uart} from './Uart/Uart';
import {CloudManager} from './Cloud/CloudManager';
import {DbRef} from './Data/DbReference';
import {MeshMonitor} from './MeshMonitor/MeshMonitor';
const LOG = require('debug-level')('crownstone-hub-base')

class CrownstoneHubClass {
  uart     : Uart;
  cloud    : CloudManager;
  mesh     : MeshMonitor;

  launched = false

  constructor() {
    this.uart     = new Uart();
    this.cloud    = new CloudManager()
    this.mesh     = new MeshMonitor()
  }


  async initialize() {
    LOG.info("Launching Modules");
    if (this.launched === false) {
      // execute modules
      await this.uart.initialize();
      LOG.info("Uart initialized")
      await this.cloud.initialize();
      LOG.info("Cloud initialized")

      this.launched = true;
    }
  }

  async cleanupAndDestroy() {
    await CrownstoneHub.cloud.cleanup();
    await DbRef.hub.deleteAll();
    await DbRef.user.deleteAll();
    await DbRef.power.deleteAll();
    await DbRef.energy.deleteAll();
  }

}


export const CrownstoneHub = new CrownstoneHubClass()
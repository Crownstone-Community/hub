import {Uart} from './Uart/Uart';
import {CloudManager} from './Cloud/CloudManager';
import {eventBus} from './EventBus';
import {topics} from './topics';
import {DbRef} from './Data/DbReference';


class CrownstoneHubClass {
  uart     : Uart;
  cloud    : CloudManager;

  launched = false
  eventsRegistered = false

  constructor() {
    this.uart     = new Uart();
    this.cloud    = new CloudManager()
  }


  async initialize() {
    console.log("Launching Modules");
    if (this.launched === false) {
      // execute modules
      await this.uart.initialize();
      console.log("Uart initialized")
      await this.cloud.initialize();
      console.log("Cloud initialized")

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
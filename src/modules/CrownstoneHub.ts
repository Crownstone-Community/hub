import {Uart} from './Uart/Uart';
import {CloudManager} from './Cloud/CloudManager';


class CrownstoneHubClass {
  uart     : Uart;
  cloud    : CloudManager;

  launched = false

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


}


export const CrownstoneHub = new CrownstoneHubClass()
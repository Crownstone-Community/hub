import {EventBusClass} from './EventBus';
import {MeshMonitor} from './MeshMonitor/MeshMonitor';
import {Uart} from './Uart/Uart';
import {CrownstoneCloud} from 'crownstone-cloud';
import {DbRef} from './Data/DbReference';
import {CrownstoneSSE} from 'crownstone-sse/dist';
import {CloudManager} from './Cloud/CloudManager';




class CrownstoneHubClass {
  uart     : Uart;
  sse      : CrownstoneSSE;
  cloud    : CloudManager;
  meshMonitor: MeshMonitor

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

      // check if there is a hub entry in the hub db.



      this.launched = true;
    }
  }


}


export const CrownstoneHub = new CrownstoneHubClass()
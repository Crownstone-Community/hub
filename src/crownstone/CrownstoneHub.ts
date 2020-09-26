import {Uart} from './Uart/Uart';
import {CloudManager} from './Cloud/CloudManager';
import {DbRef, EMPTY_DATABASE} from './Data/DbReference';
import {MeshMonitor} from './MeshMonitor/MeshMonitor';
import {CloudCommandHandler} from './Cloud/CloudCommandHandler';
import {Timekeeper} from './Actions/Timekeeper';
import {Logger} from '../Logger';

const log = Logger(__filename);


export class CrownstoneHubClass implements CrownstoneHub {
  uart        : Uart;
  cloud       : CloudManager;
  mesh        : MeshMonitor;
  timeKeeper  : Timekeeper;

  launched = false

  constructor() {
    this.cloud = new CloudManager()
    this.uart  = new Uart();
    this.mesh  = new MeshMonitor(this);

    this.timeKeeper = new Timekeeper(this);
    CloudCommandHandler.loadManager(this.cloud);
  }


  async initialize() {
    let hub = await DbRef.hub.get();
    if (hub && hub.id) {
      log.info("Launching Modules");

      if (this.launched === false) {
        // execute modules
        await this.cloud.initialize();
        log.info("Cloud initialized")

        hub = await DbRef.hub.get();
        if (hub && hub.id) {
          await this.uart.initialize();
          log.info("Uart initialized")

          this.mesh.init()
          this.timeKeeper.init()

          this.launched = true;
        }
        else {
          log.info("Hub could not log into cloud. 401.");
        }
      }
    }
    else {
      log.info("Hub not configured yet.")
    }
  }

  async cleanupAndDestroy() {
    await this.mesh.cleanup();

    await this.timeKeeper.stop();

    await CrownstoneHub.cloud.cleanup();

    await EMPTY_DATABASE();
  }

}


export const CrownstoneHub = new CrownstoneHubClass()
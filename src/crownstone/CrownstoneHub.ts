import {Uart} from './Uart/Uart';
import {CloudManager} from './Cloud/CloudManager';
import {DbRef, EMPTY_DATABASE} from './Data/DbReference';
import {MeshMonitor} from './MeshMonitor/MeshMonitor';
import {CloudCommandHandler} from './Cloud/CloudCommandHandler';
import {Timekeeper} from './Actions/Timekeeper';
import {Logger} from '../Logger';
import {HubStatus, resetHubStatus} from './HubStatus';
import {eventBus} from './HubEventBus';
import {topics} from './topics';

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

    eventBus.on(topics.HUB_CREATED,() => { this.initialize(); });
  }

  async initialize() {
    resetHubStatus();
    let hub = await DbRef.hub.get();
    if (hub && hub.id) {
      log.info("Launching Modules");

      if (this.launched === false) {
        // execute modules
        try {
          await this.cloud.initialize();
          log.info("Cloud initialized")

          await this.uart.initialize();
          log.info("Uart initialized")
          HubStatus.uartReady = true;

          this.mesh.init()
          this.timeKeeper.init()

          this.launched = true;
          HubStatus.initialized = true;
        }
        catch (e) {
          if (e === 401) {
            log.info("Initialization failed. Cloud could not authenticate hub.");
          }
          else {
            log.info("Initialization failed", e);
          }
        }
      }
    }
    else {
      log.info("Hub not configured yet.")
    }

    hub = await DbRef.hub.get();
    HubStatus.belongsToSphere = hub?.sphereId || "none";
  }

  async cleanupAndDestroy() {
    await this.mesh.cleanup();

    await this.timeKeeper.stop();

    await CrownstoneHub.cloud.cleanup();

    await EMPTY_DATABASE();
  }

}


export const CrownstoneHub = new CrownstoneHubClass()

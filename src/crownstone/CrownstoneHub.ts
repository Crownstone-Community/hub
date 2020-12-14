import {Uart} from './Uart/Uart';
import {CloudManager} from './Cloud/CloudManager';
import {Dbs} from './Data/DbReference';
import {MeshMonitor} from './MeshMonitor/MeshMonitor';
import {CloudCommandHandler} from './Cloud/CloudCommandHandler';
import {Timekeeper} from './Actions/Timekeeper';
import {Logger} from '../Logger';
import {HubStatus, resetHubStatus} from './HubStatus';
import {eventBus} from './HubEventBus';
import {topics} from './topics';
import Timeout = NodeJS.Timeout;
import {CrownstoneUtil} from './CrownstoneUtil';
import {CONFIG} from '../config';
import {EMPTY_DATABASE} from './Data/DbUtil';

const log = Logger(__filename);


export class CrownstoneHubClass implements CrownstoneHub {
  uart        : Uart;
  cloud       : CloudManager;
  mesh        : MeshMonitor;
  timeKeeper  : Timekeeper;

  linkedStoneCheckInterval : Timeout

  constructor() {
    this.cloud = new CloudManager()
    this.uart  = new Uart(this.cloud.cloud);
    this.mesh  = new MeshMonitor();

    this.timeKeeper = new Timekeeper(this);
    CloudCommandHandler.loadManager(this.cloud);

    eventBus.on(topics.HUB_CREATED,() => { this.initialize(); });


    if (CONFIG.enableUart) {
      this.uart.initialize();
      log.info("Uart initialized");
    }

    HubStatus.uartReady = true;
  }

  async initialize() {
    resetHubStatus();

    let hub = await Dbs.hub.get();
    if (hub && hub.cloudId !== 'null') {
      log.info("Launching Modules");

      clearInterval(this.linkedStoneCheckInterval);
      this.linkedStoneCheckInterval = setInterval(() => { CrownstoneUtil.checkLinkedStoneId(); }, 30*60*1000);
      // load the key if we already have it.
      if (hub.uartKey) {
        this.uart.connection.encryption.setKey(hub.uartKey);
        this.uart.connection.hub.setStatus({ clientHasBeenSetup: true });
      }

      try {
        await this.cloud.initialize();
        log.info("Cloud initialized");

        log.info("Checking linked StoneId");
        await CrownstoneUtil.checkLinkedStoneId();
        log.info("Checked linked StoneId.");

        try {
          log.info("Setting up UART encryption...")
          await this.uart.refreshUartEncryption();
          log.info("UART key loaded.")
        }
        catch (e) {
          log.warn("Could not obtain connection key.")
        }


        this.mesh.init()
        this.timeKeeper.init()

        HubStatus.initialized = true;

        await this.uart.connection.hub.setStatus({
          clientHasBeenSetup: true,
          encryptionRequired: true,
          clientHasInternet: true,
        });
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
    else {
      log.info("Hub not configured yet.")
    }


    hub = await Dbs.hub.get();
    HubStatus.belongsToSphere = hub?.sphereId || "none";
  }


  async cleanupAndDestroy(partial = false) {
    clearInterval(this.linkedStoneCheckInterval);

    this.uart.connection.encryption.removeKey();
    this.uart.connection.hub.setStatus({ clientHasBeenSetup: false });
    await this.mesh.cleanup();
    await this.timeKeeper.stop();
    await CrownstoneHub.cloud.cleanup();

    if (partial) {
      console.log("Crippling hub instance...");
      await Dbs.hub.partialDelete();
      console.log("Crippling hub instance. DONE!");
    }
    else {
      console.log("Deleting hub database...");
      await EMPTY_DATABASE();
      console.log("Deleting hub database. DONE!");
    }
  }

}


export const CrownstoneHub = new CrownstoneHubClass()

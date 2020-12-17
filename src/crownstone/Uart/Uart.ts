import {CrownstoneUart, UartTopics} from 'crownstone-uart';
import { PromiseManager } from './PromiseManager';
import {eventBus} from '../HubEventBus';
import {CONFIG} from '../../config';

import {Logger} from '../../Logger';
import {topics} from '../topics';
import {UartHubDataCommunication} from './UartHubDataCommunication';
import {Dbs} from '../Data/DbReference';
import {CrownstoneUtil} from '../CrownstoneUtil';
import {CrownstoneCloud} from 'crownstone-cloud';
import {HubStatusManager} from './HubStatusManager';
const log = Logger(__filename);


export class Uart implements UartInterface {
  connection      : CrownstoneUart;
  queue           : PromiseManager;
  hubDataHandler  : UartHubDataCommunication;
  ready           : boolean = false
  cloud           : CrownstoneCloud;

  initializing    : false;


  constructor(cloud: CrownstoneCloud) {
    this.queue = new PromiseManager();
    this.cloud = cloud;

    this.connection  = new CrownstoneUart();
    this.connection.hub.setMode("HUB");

    this.hubDataHandler = new UartHubDataCommunication(this.connection);
    this.forwardEvents();
  }

  forwardEvents() {
    // generate a list of topics that can be remapped from connection to lib.
    let eventsToForward = [
      {uartTopic: UartTopics.MeshServiceData, moduleTopic: topics.MESH_SERVICE_DATA},
    ];


    // forward all required events to the module eventbus.
    eventsToForward.forEach((event) => {
      let moduleEvent = event.moduleTopic;
      if (!event.moduleTopic) {
        moduleEvent = event.uartTopic;
      }

      this.connection.on(event.uartTopic, (data) => { eventBus.emit(moduleEvent, data); })
    });

    this.connection.on(UartTopics.HubDataReceived, (data: Buffer) => { this.hubDataHandler.handleIncomingHubData(data) })
    this.connection.on(UartTopics.KeyRequested,() => {
      log.info("Uart is requesting a key");
      this.refreshUartEncryption();
    });
  }



  async initialize() {
    try {
      await this.connection.start(CONFIG.uartPort);
      await HubStatusManager.setStatus({
        clientHasBeenSetup: false,
        encryptionRequired: false,
        clientHasInternet: false,
      });
      log.info("Uart is ready")
      this.ready = true;
    }
    catch (err) {
      this.ready = false;
      throw err;
    }
  }


  async refreshUartEncryption() {
    if (!Dbs.hub) { return; }
    if (await Dbs.hub.isSet() === false) { return; }

    let hub = await Dbs.hub.get();
    if (!hub) { return; }

    if (hub.uartKey) {
      this.connection.encryption.setKey(hub.uartKey);
    }

    await CrownstoneUtil.checkLinkedStoneId();

    // this is done regardless since we might require a new key.
    let uartKey;
    try {
      uartKey = await this.cloud.hub().getUartKey();
    }
    catch (err) {
      log.warn("Could not obtain the uart key from the cloud...", err);
      return;
    }
    hub = await Dbs.hub.get();
    if (uartKey !== hub?.uartKey && hub) {
      hub.uartKey = uartKey;
      await Dbs.hub.save(hub);
    }
    this.connection.encryption.setKey(uartKey);
  }


  async switchCrownstones(switchPairs : SwitchData[]) {
    if (!this.ready) { throw "NOT_READY"; }

    return this.queue.register(() => {
      log.info("Dispatching switchAction", switchPairs);
      return this.connection.switchCrownstones(switchPairs);
    }, "switchCrownstones from Uart" + JSON.stringify(switchPairs));
  }

  registerTrackedDevice(
    trackingNumber:number,
    locationUID:number,
    profileId:number,
    rssiOffset:number,
    ignoreForPresence:boolean,
    tapToToggleEnabled:boolean,
    deviceToken:number,
    ttlMinutes:number
  ) {
    if (!this.ready) { throw "NOT_READY"; }

    this.queue.register(() => {
      return this.connection.control.registerTrackedDevice(
        trackingNumber,
        locationUID,
        profileId,
        rssiOffset,
        ignoreForPresence,
        tapToToggleEnabled,
        deviceToken,
        ttlMinutes,
      )
    })
  }
}
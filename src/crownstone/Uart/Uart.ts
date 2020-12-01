import {CrownstoneUart, UartTopics} from 'crownstone-uart';
import { PromiseManager } from './PromiseManager';
import {eventBus} from '../HubEventBus';
import {CONFIG} from '../../config';

import {Logger} from '../../Logger';
import {topics} from '../topics';
import {UartHubDataCommunication} from './UartHubDataCommunication';
import {CrownstoneCloud} from 'crownstone-cloud';
import {Dbs} from '../Data/DbReference';
const log = Logger(__filename);


export class Uart implements UartInterface {
  connection     : CrownstoneUart;
  queue    : PromiseManager;
  hubDataHandler: UartHubDataCommunication;
  ready : boolean = false
  cloud : CrownstoneCloud;

  constructor(cloud: CrownstoneCloud) {
    this.queue = new PromiseManager();
    this.cloud = cloud;

    this.connection  = new CrownstoneUart();
    this.connection.uart.setMode("HUB");

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
    this.connection.on(UartTopics.KeyRequested,() => { this.refreshUartEncryption(); })
  }



  async initialize() {
    try {
      await this.connection.start(CONFIG.uartPort);
      await this.connection.uart.setHubStatus({
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
    let hub = await Dbs.hub.get();
    if (hub) {
      if (hub.uartKey) {
        this.connection.uart.setKey(hub.uartKey);
      }

      // this is done regardless since we might require a new key.
      let macAddress = await this.connection.getMacAddress();
      let uartKey = await this.cloud.hub().getUartKey(macAddress);

      if (uartKey !== hub?.uartKey && hub) {
        hub.uartKey = uartKey;
        await Dbs.hub.save(hub);
      }
      this.connection.uart.setKey(uartKey);
    }
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
      return this.connection.registerTrackedDevice(
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
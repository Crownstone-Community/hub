import { CrownstoneUart } from 'crownstone-uart'
import { PromiseManager } from './PromiseManager';
import {eventBus} from '../EventBus';

const LOG = require('debug-level')('crownstone-uart-bridge')

interface SwitchPair {
  crownstoneId: number,
  switchState: number
}

export class Uart {
  uart     : CrownstoneUart;
  queue    : PromiseManager;
  ready : boolean = false

  constructor() {
    this.queue = new PromiseManager();
    this.uart  = new CrownstoneUart();

    this.forwardEvents();
  }

  forwardEvents() {
    // generate a list of topics that can be remapped from uart to lib.
    let eventsToForward = [
      {uartTopic: "MeshServiceData", moduleTopic: "MESH_SERVICE_DATA"},
    ];

    // forward all required events to the module eventbus.
    eventsToForward.forEach((event) => {
      let moduleEvent = event.moduleTopic;
      if (!event.moduleTopic) {
        moduleEvent = event.uartTopic;
      }
      this.uart.on(event.uartTopic, (data) => { eventBus.emit(moduleEvent, data); })
    });
  }


  async initialize() {
    try {
      await this.uart.start()
      LOG.info("Uart is ready")
      this.ready = true;
    }
    catch (err) {
      this.ready = false;
      throw err;
    }
  }


  async switchCrownstones(switchPairs : SwitchData[]) {
    if (!this.ready) { throw "NOT_READY"; }

    return this.queue.register(() => {
      LOG.info("Dispatching switchAction", switchPairs);
      return this.uart.switchCrownstones(switchPairs);
    });
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
      return this.uart.registerTrackedDevice(
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
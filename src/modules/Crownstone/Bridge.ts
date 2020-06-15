import { ModuleBase }     from '../ModuleBaseClass';
import { CrownstoneUart } from 'crownstone-uart'
import { PromiseManager } from './PromiseManager';
import { EventBusClass }  from '../EventBus';

interface SwitchPair {
  crownstoneId: number,
  switchState: number
}

export class Bridge extends ModuleBase {
  uart  : CrownstoneUart;
  queue : PromiseManager;
  ready : boolean = false

  constructor(eventBus: EventBusClass) {
    super(eventBus);

    this.queue = new PromiseManager();
    this.uart  = new CrownstoneUart();

    this.forwardEvents();
  }

  forwardEvents() {
    // generate a list of topics that can be remapped from uart to lib.
    let eventsToForward = [
      {bluenetTopic: "MeshServiceData", moduleTopic: "MeshServiceData"},
    ];

    // forward all required events to the module eventbus.
    eventsToForward.forEach((event) => {
      let moduleEvent = event.moduleTopic;
      if (!event.moduleTopic) {
        moduleEvent = event.bluenetTopic;
      }
      this.uart.on(event.bluenetTopic, (data) => { this.eventBus.emit(moduleEvent, data); })
    });

  }


  async initialize() {
    try {
      await this.uart.start()
      this.ready = true;
    }
    catch (err) {
      this.ready = false;
      throw err;
    }
  }


  switchCrownstones(switchPairs : SwitchPair[]) {
    if (!this.ready) { throw "NOT_READY"; }

    this.queue.register(() => {
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
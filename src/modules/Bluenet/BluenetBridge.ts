import { ModuleBase }     from '../ModuleBaseClass';
import { BluenetUart }    from 'bluenet-nodejs-lib-uart'
import { PromiseManager } from './PromiseManager';
import {EventBusClass} from '../EventBus';

interface SwitchPair {
  crownstoneId: number,
  switchState: number
}

export class BluenetBridge extends ModuleBase {
  bluenet : BluenetUart;
  queue   : PromiseManager;
  ready   : boolean = false

  constructor(eventBus: EventBusClass) {
    super(eventBus);

    this.queue   = new PromiseManager();
    this.bluenet = new BluenetUart();

    this.forwardEvents();
  }

  forwardEvents() {
    // generate a list of topics that can be remapped from bluenet to lib.
    let eventsToForward = [
      {bluenetTopic: "MeshServiceData", moduleTopic: "MeshServiceData"},
    ];

    // forward all required events to the module eventbus.
    eventsToForward.forEach((event) => {
      let moduleEvent = event.moduleTopic;
      if (!event.moduleTopic) {
        moduleEvent = event.bluenetTopic;
      }
      this.bluenet.on(event.bluenetTopic, (data) => { this.eventBus.emit(moduleEvent, data); })
    });

  }


  async initialize() {
    try {
      await this.bluenet.start()
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
      return this.bluenet.switchCrownstones(switchPairs);
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
      return this.bluenet.registerTrackedDevice(
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
import {EventBusClass} from './EventBus';


export class ModuleBase {
  eventBus : EventBusClass;

  constructor(eventBus: EventBusClass) {
    this.eventBus = eventBus;
  }

  // This is the one to overload. It should set the ready boolean when it is finished.
  initialize() : Promise<void> {
    return Promise.resolve()
  }

}
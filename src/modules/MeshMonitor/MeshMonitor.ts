import {ModuleBase} from '../ModuleBaseClass';
import {EventBusClass} from '../EventBus';


export class MeshMonitor extends ModuleBase {
  eventBus : EventBusClass;
  topology = {nodes: [], edges: []}

  initialize(eventBus: EventBusClass) : Promise<void> {
    this.eventBus = eventBus;

    this.eventBus.on("MeshServiceData", this._handleServiceData.bind(this))
    return Promise.resolve()
  }

  _handleServiceData(serviceData: ServiceDataJson) {

  }



}
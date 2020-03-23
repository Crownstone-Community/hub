import {ModuleBase} from '../ModuleBaseClass';
import {EventBusClass} from '../EventBus';


export class MeshMonitor extends ModuleBase {
  topology = {nodes: [], edges: []}

  initialize() : Promise<void> {
    this.eventBus.on("MeshServiceData", this._handleServiceData.bind(this))
    return Promise.resolve()
  }

  _handleServiceData(serviceData: ServiceDataJson) {
    console.log("I got serviceData", serviceData);
  }
}
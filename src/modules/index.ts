import {BluenetBridge} from './Bluenet/BluenetBridge';
import {EventBusClass} from './EventBus';
import {MeshMonitor} from './MeshMonitor/MeshMonitor';

let launched = false;

const eventBus = new EventBusClass();


interface Modules {
  bluenet:     BluenetBridge,
  meshMonitor: MeshMonitor
  eventBus:    EventBusClass,
}


export let Modules : Modules = {
  bluenet     : new BluenetBridge(eventBus),
  meshMonitor : new MeshMonitor(eventBus),
  eventBus    : eventBus,
}


export async function LaunchModules() {
  console.log("Launching Modules")
  if (launched === false) {
    // execute modules
    console.log("intializig")
    await Modules.bluenet.initialize();
    console.log("BluenetUart connection ready!");

    await Modules.meshMonitor.initialize();


    launched = true;
  }
}


async function openUartConnection() {

}
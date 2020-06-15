import {EventBusClass} from './EventBus';
import {MeshMonitor} from './MeshMonitor/MeshMonitor';
import {Bridge} from './Crownstone/Bridge';

let launched = false;

const eventBus = new EventBusClass();


interface Modules {
  bluenet:     Bridge,
  meshMonitor: MeshMonitor
  eventBus:    EventBusClass,
}


export let Modules : Modules = {
  bluenet     : new Bridge(eventBus),
  meshMonitor : new MeshMonitor(eventBus),
  eventBus    : eventBus,
}


export async function LaunchModules() {
  console.log("Launching Modules")
  if (launched === false) {
    // execute modules
    console.log("intializig")
    // await Modules.uart.initialize();
    console.log("BluenetUart connection ready!");

    // await Modules.meshMonitor.initialize();


    launched = true;
  }
}


async function openUartConnection() {

}
import {BluenetBridge} from './Bluenet/BluenetBridge';
import {EventBusClass} from './EventBus';
import {Event} from '@loopback/repository';

let launched = false;

const eventBus = new EventBusClass();


interface Modules {
  bluenet:  BluenetBridge,
  eventBus: EventBusClass
}


export let Modules : Modules = {
  bluenet  : new BluenetBridge(eventBus),
  eventBus : eventBus,
}


export async function LaunchModules() {
  if (launched === false) {
    // execute modules
    await openUartConnection();

    launched = true;
  }
}


async function openUartConnection() {
  try {
    await Modules.bluenet.initialize();
    console.log("BluenetUart connection ready!");
  }
  catch (err) {
    console.log("Could not open UART connection. Trying again...");
    setTimeout(() => { openUartConnection(); }, 1000)
  }
}
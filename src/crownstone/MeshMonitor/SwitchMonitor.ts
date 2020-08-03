import {DbRef} from '../Data/DbReference';


export class SwitchMonitor {
  lastSwitchStates : {[key:number]: number} = {};

  collect( crownstoneId: number, switchState: number ) {
    if (switchState !== this.lastSwitchStates[crownstoneId]) {
      DbRef.switches.create({ stoneUID: crownstoneId, switchState: switchState, timestamp: new Date() });
      this.lastSwitchStates[crownstoneId] = switchState;
    }
  }
}
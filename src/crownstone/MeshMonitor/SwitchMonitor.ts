import {DbRef} from '../Data/DbReference';


export class SwitchMonitor {
  lastSwitchState : number | null = null

  collect( crownstoneId: number, switchState: number ) {
    if (switchState !== this.lastSwitchState) {
      DbRef.switches.create({ stoneUID: crownstoneId, switchState: switchState});
      this.lastSwitchState = switchState;
    }
  }
}
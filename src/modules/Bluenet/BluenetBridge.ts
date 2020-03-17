import {ModuleBase} from '../ModuleBaseClass';


interface SwitchPair {
  crownstoneId: number,
  switchState: number
}

class BluenetBridge extends ModuleBase {


  initialize(): Promise<void> {
    return Promise.resolve();
  }


  switchCrownstones(switchPairs : SwitchPair[]) {

  }

}
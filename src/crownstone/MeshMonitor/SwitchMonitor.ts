import {DbRef} from '../Data/DbReference';
import {MemoryDb} from '../Data/MemoryDb';
import {CloudCommandHandler} from '../Cloud/CloudCommandHandler';


/**
 * This class will keep an in-memory cache of the known switch-states.
 * If a switchstate that is different from the cache is received,
 * we update the state in the cloud.
 */
export class SwitchMonitor {
  lastSwitchStates : {[key:number]: number} = {};

  collect( crownstoneUid: number, switchState: number, upload: boolean = true ) {
    if (switchState !== this.lastSwitchStates[crownstoneUid]) {
      DbRef.switches.create({ stoneUID: crownstoneUid, switchState: switchState, timestamp: new Date() });
      this.lastSwitchStates[crownstoneUid] = switchState;

      if (MemoryDb.stones[crownstoneUid] && upload) {
        let cloudId = MemoryDb.stones[crownstoneUid].cloudId;
        let cloudSwitchState = Math.min(0, Math.max(switchState));

        CloudCommandHandler.addToQueue((CM) => {
          return CM.cloud.crownstone(cloudId).setCurrentSwitchState(cloudSwitchState).catch()
        })
      }

    }
  }
}
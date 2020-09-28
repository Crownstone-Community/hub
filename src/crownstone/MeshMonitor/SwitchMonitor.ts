import {DbRef} from '../Data/DbReference';
import {MemoryDb} from '../Data/MemoryDb';
import {CloudCommandHandler} from '../Cloud/CloudCommandHandler';


/**
 * This class will keep an in-memory cache of the known switch-states.
 * If a switchstate that is different from the cache is received,
 * we update the state in the cloud.
 */
export class SwitchMonitor {
  lastSwitchStates : {[stoneUID : string]: number} = {};

  collect( crownstoneUid: number, switchState: number, upload: boolean = true ) {
    let switchStateConverted = Math.min(100, Math.max(switchState));

    if (switchStateConverted !== this.lastSwitchStates[crownstoneUid]) {
      DbRef.switches.create({ stoneUID: crownstoneUid, switchState: switchStateConverted, timestamp: new Date() });
      this.lastSwitchStates[crownstoneUid] = switchStateConverted;

      if (MemoryDb.stones[crownstoneUid] && upload) {
        let cloudId = MemoryDb.stones[crownstoneUid].cloudId;
        CloudCommandHandler.addToQueue((CM) => {
          return CM.cloud.crownstone(cloudId).setCurrentSwitchState(switchStateConverted).catch()
        })
      }

    }
  }
}
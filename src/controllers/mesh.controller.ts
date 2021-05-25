
import {get, post, requestBody} from '@loopback/rest';
import {CrownstoneHub} from '../crownstone/CrownstoneHub';
import {authenticate} from '@loopback/authentication';
import {SecurityTypes} from '../constants/Constants';
import {fillWithStoneData, MemoryDb} from '../crownstone/data/MemoryDb';


interface CrownstoneInMeshData {
  uid:                 number,
  name:                string | null,
  cloudId:             string | null,
  locationName:        string | null,
  lastSeen:            Date,
  lastSeenSwitchState: number | null
}

export class MeshController {
  constructor() {}

  @get('/crownstonesInMesh')
  @authenticate(SecurityTypes.sphere)
  async getCrownstonesInMesh() : Promise<CrownstoneInMeshData[]> {
    let topology = {...CrownstoneHub.mesh.network.crownstonesInMesh};
    let result : CrownstoneInMeshData[] = [];
    Object.keys(topology).forEach((uid) => {
        let data : any = fillWithStoneData(uid);
        data.lastSeen = new Date(topology[uid]);
        data.lastSeenSwitchState = null;
        if (data.cloudId) {
          let switchState: number | null = CrownstoneHub.mesh.switch.lastSwitchStates[uid];
          if (switchState === undefined) {
            switchState = null;
          } else {
            switchState = Number(switchState);
          }
          data.lastSeenSwitchState = switchState;
        }
        result.push(data);
    })

    return result;
  }

  @get('/network')
  @authenticate(SecurityTypes.sphere)
  async getTopology() : Promise<Edge[]> {
    return Object.values(CrownstoneHub.mesh.network.topology);
  }

  @post('/network')
  @authenticate(SecurityTypes.sphere)
  async refreshTopology() : Promise<void> {
    await CrownstoneHub.uart.refreshMeshTopology();

    CrownstoneHub.mesh.network.resetTopology();
  }
}

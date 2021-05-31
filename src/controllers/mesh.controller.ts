
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

  @get('/network/crownstones')
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
  async getTopology() : Promise<{
    edges: Edge[],
    nodes: {[shortUid: string]: Crownstone },
    locations: {[cloudId: string]: Location_t}
  }> {
    let edges = Object.values(CrownstoneHub.mesh.network.topology);
    let nodes = MemoryDb.stones;
    let locations = MemoryDb.locationByCloudId;
    return {edges, nodes, locations}
  }

 @get('/network/statistics')
  @authenticate(SecurityTypes.sphere)
  async getStatistics() : Promise<{
    [crownstoneId: string] : LossStatistics
  }> {
    return CrownstoneHub.mesh.network.lossStatistics
  }

  @post('/network/refreshTopology')
  @authenticate(SecurityTypes.sphere)
  async refreshTopology() : Promise<void> {
    await CrownstoneHub.uart.refreshMeshTopology();

    CrownstoneHub.mesh.network.resetTopology();
  }
}

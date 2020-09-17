// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, post, requestBody} from '@loopback/rest';
import {CrownstoneHub} from '../crownstone/CrownstoneHub';
import {authenticate} from '@loopback/authentication';

export class MeshController {
  constructor() {}


  @get('/stonesInMesh')
  @authenticate('csTokens')
  async switchCrownstones() : Promise<{ [stoneUid : number] : number }> {
    return CrownstoneHub.mesh.topology.crownstonesInMesh;
  }
}

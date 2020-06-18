import {CrownstoneSSE} from 'crownstone-sse/dist';
import {CrownstoneCloud} from 'crownstone-cloud';
import {DbRef} from '../Data/DbReference';
import {Hub} from '../../models/hub.model';
import {REST} from 'crownstone-cloud/dist/rest/cloudAPI';
import {MemoryDb} from '../Data/MemoryDb';


export class CloudManager {

  cloud   : CrownstoneCloud;
  sse     : CrownstoneSSE;

  sphereId: string;



  constructor() {
    this.cloud = new CrownstoneCloud("http://localhost:3000/api/")
  }

  async initialize() {
    let hub = await DbRef.hub.get();
    if (hub) {
      console.log("We have hub data")
      await this.login(hub);
      // await this.sync();
      // await this.setupSSE(hub)
    }
    else {
      console.log("No hub data yet")
    }
  }

  async login(hub: Hub) {
    this.sphereId = hub.sphereId;
    if (!hub.accessToken || hub.accessToken && new Date() <= hub.accessTokenExpiration) {
      await this.cloud.hubLogin(hub.token, hub.cloudId)

      hub.accessToken = this.cloud.accessToken;
      hub.accessTokenExpiration = this.cloud.accessTokenExpiration;
      await DbRef.hub.update(hub);
    }
    REST.setAccessToken(hub.accessToken)
    await this.setupSSE(hub);
  }

  async sync() {
    // download stones from sphere, load in memory

    return REST.forSphere(this.sphereId).getStonesInSphere()
      .then((result : CloudStoneData[]) => {
        if (result) {
          MemoryDb.loadCloudStoneData(result);
        }
      })
      .catch((err: any) => {
        console.log(err);
      })
  }

  handleSseEvent = (event: SseEvent) => {
    // handle token expired and other system events.
    console.log("SSE EVENT:", event)
  }

  async setupSSE(hub: Hub) {
    this.sse = new CrownstoneSSE({hubLoginBase: 'http://localhost:3000/api/Hubs/'})
    // TODO: add automatic retry.
    await this.sse.hubLogin(hub.cloudId,hub.token);

    this.sse.start(this.handleSseEvent)
  }
}
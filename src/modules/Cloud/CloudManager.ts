import {CrownstoneSSE} from 'crownstone-sse/dist';
import {CrownstoneCloud} from 'crownstone-cloud';
import {DbRef} from '../Data/DbReference';
import {Hub} from '../../models/hub.model';
import {REST} from 'crownstone-cloud/dist/rest/cloudAPI';
import {MemoryDb} from '../Data/MemoryDb';
import {Util} from '../../util/Util';
import {SseEventHandler} from './SseEventHandler';
import {eventBus} from '../EventBus';


export class CloudManager {

  cloud           : CrownstoneCloud;
  sse             : CrownstoneSSE | null = null;
  sseEventHandler : SseEventHandler;

  sphereId: string;
  eventsRegistered = false;

  constructor() {
    this.cloud = new CrownstoneCloud("http://localhost:3000/api/")
    this.sseEventHandler = new SseEventHandler();

    this.setupEvents();
  }

  setupEvents() {
    if (this.eventsRegistered === false) {
      eventBus.on("TOKEN_EXPIRED",       () => { this.initialize(); })
      eventBus.on("CLOUD_SYNC_REQUIRED", () => { this.sync(); })
      this.eventsRegistered = true;
    }
  }


  async initialize() {
    let hub = await DbRef.hub.get();
    if (hub) {
      await this.login(hub);
      await this.setupSSE(hub);
      await this.sync();
    }
    else {
      console.log("No hub data yet")
    }
  }

  async login(hub: Hub) {
    this.sphereId = hub.sphereId;

    // LOGIN:
    let cloudLoggedIn = false;
    while (cloudLoggedIn == false) {
      try      { await this.cloud.hubLogin(hub.cloudId, hub.token); cloudLoggedIn = true; }
      catch(e) { console.log("Error in login to cloud",e); await Util.wait(5000); }
    }
    hub.accessToken = this.cloud.accessToken;
    hub.accessTokenExpiration = this.cloud.accessTokenExpiration;
    await DbRef.hub.update(hub);

    // STARTUP
    REST.setAccessToken(hub.accessToken)
  }

  async sync() {
    // download stones from sphere, load in memory
    let stonesSynced = false;
    while (stonesSynced == false) {
      try {
        let stones : CloudStoneData[] = await REST.forSphere(this.sphereId).getStonesInSphere()
        if (stones) {
          MemoryDb.loadCloudStoneData(stones);
        }
        stonesSynced = true;
      }
      catch(e) { console.log("Error in sync", e); await Util.wait(5000); }
    }

    // TODO: sphere users & their tokens.
    // LOAD IN MONGO DB.

  }



  async setupSSE(hub: Hub) {
    if (this.sse === null) {
      this.sse = new CrownstoneSSE({hubLoginBase: 'http://localhost:3000/api/Hubs/'});
    }

    let sseLoggedIn = false;
    while (sseLoggedIn == false) {
      try      { await this.sse.hubLogin(hub.cloudId, hub.token); sseLoggedIn = true; }
      catch(e) { console.log("Error in SSE", e); await Util.wait(5000); }
    }

    this.sse.start(this.sseEventHandler.handleSseEvent)
  }
}


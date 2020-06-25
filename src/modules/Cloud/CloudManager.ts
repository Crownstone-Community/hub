import {CrownstoneSSE} from 'crownstone-sse/dist';
import {CrownstoneCloud, REST} from 'crownstone-cloud';
import {DbRef} from '../Data/DbReference';
import {Hub} from '../../models/hub.model';
import {MemoryDb} from '../Data/MemoryDb';
import {Util} from '../../util/Util';
import {SseEventHandler} from './SseEventHandler';
import {eventBus} from '../EventBus';

const RETRY_INTERVAL_MS = 5000;


export class CloudManager {

  cloud           : CrownstoneCloud;
  sse             : CrownstoneSSE | null = null;
  sseEventHandler : SseEventHandler;

  initializeInProgress = false;
  loginInProgress = false;
  syncInProgress = false;
  sseSetupInprogress = false;

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
    if (this.initializeInProgress === true) { return; }
    this.initializeInProgress = true;
    let hub = await DbRef.hub.get();
    if (hub) {
      await this.login(hub);
      await this.setupSSE(hub);
      await this.sync();
    }
    else {
      console.log("No hub data yet")
    }
    this.initializeInProgress = false;
  }



  async login(hub: Hub) {
    if (this.loginInProgress === true) { return; }
    this.loginInProgress = true;

    this.sphereId = hub.sphereId;

    // LOGIN:
    let cloudLoggedIn = false;
    while (cloudLoggedIn === false) {
      try      { await this.cloud.hubLogin(hub.cloudId, hub.token); cloudLoggedIn = true; }
      catch(e) { console.log("Error in login to cloud",e); await Util.wait(RETRY_INTERVAL_MS); }
    }
    hub.accessToken = this.cloud.accessToken;
    hub.accessTokenExpiration = this.cloud.accessTokenExpiration;
    await DbRef.hub.update(hub);

    // STARTUP
    REST.setAccessToken(hub.accessToken)
    this.loginInProgress = false;
  }


  async sync() {
    if (this.syncInProgress === true) { return; }
    this.syncInProgress = true;

    // download stones from sphere, load in memory
    let stonesSynced = false;
    while (stonesSynced === false) {
      try {
        let stones : CloudStoneData[] = await REST.forSphere(this.sphereId).getStonesInSphere()
        if (stones) { MemoryDb.loadCloudStoneData(stones); }
        stonesSynced = true;
      }
      catch(e) { console.log("Error in sync", e); await Util.wait(RETRY_INTERVAL_MS); }
    }

    let usersObtained = false;
    while (usersObtained === false) {
      try {
        let sphereUsers : CloudSphereUsers = await REST.forSphere(this.sphereId).getUsers();
        let tokenSets : CloudAuthorizationTokens = await REST.forSphere(this.sphereId).getSphereAuthorizationTokens();
        usersObtained = true;
        await DbRef.user.merge(sphereUsers, tokenSets);
      }
      catch(e) { console.log("Error in sync user obtaining", e); await Util.wait(RETRY_INTERVAL_MS); }
    }


    // LOAD IN MONGO DB.

    this.syncInProgress = false;
  }



  async setupSSE(hub: Hub) {
    if (this.sseSetupInprogress === true) { return; }
    this.sseSetupInprogress = true;

    if (this.sse === null) {
      this.sse = new CrownstoneSSE({hubLoginBase: 'http://localhost:3000/api/Hubs/'});
    }

    let sseLoggedIn = false;
    while (sseLoggedIn == false) {
      try      { await this.sse.hubLogin(hub.cloudId, hub.token); sseLoggedIn = true; }
      catch(e) { console.log("Error in SSE", e); await Util.wait(RETRY_INTERVAL_MS); }
    }

    this.sse.start(this.sseEventHandler.handleSseEvent)

    this.sseSetupInprogress = false;
  }
}


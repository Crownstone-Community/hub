import {CrownstoneSSE} from 'crownstone-sse/dist';
import {CrownstoneCloud, REST} from 'crownstone-cloud';
import {DbRef} from '../Data/DbReference';
import {Hub} from '../../models/hub.model';
import {MemoryDb} from '../Data/MemoryDb';
import {Util} from '../../util/Util';
import {SseEventHandler} from './SseEventHandler';
import {eventBus} from '../EventBus';
import {topics} from '../topics';

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

  resetTriggered = false;

  constructor() {
    this.cloud = new CrownstoneCloud("http://localhost:3000/api/")
    this.sseEventHandler = new SseEventHandler();

    this.setupEvents();
  }

  setupEvents() {
    if (this.eventsRegistered === false) {
      eventBus.on(topics.HUB_CREATED,         () => { this.initialize(); });
      // eventBus.on(topics.HUB_DELETED,         () => { this.cleanup(); }); // this is done via direct call.
      eventBus.on(topics.TOKEN_EXPIRED,       () => { this.initialize(); });
      eventBus.on(topics.CLOUD_SYNC_REQUIRED, () => { this.sync();       });
      this.eventsRegistered = true;
    }
  }

  async cleanup() {
    this.resetTriggered = true;
    // wait for everything to clean up.
    while (this.initializeInProgress || this.loginInProgress || this.sseSetupInprogress || this.syncInProgress) {
      await Util.wait(100);
    }

    this.resetTriggered = false;
    // @ts-ignore
    this.sphereId = null;
    if (this.sse) {
      this.sse.stop()
      this.sse = null;
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
    while (cloudLoggedIn === false && this.resetTriggered === false) {
      try      {
        await this.cloud.hubLogin(hub.cloudId, hub.token);
        cloudLoggedIn = true;
        hub.accessToken = this.cloud.accessToken;
        hub.accessTokenExpiration = this.cloud.accessTokenExpiration;
        await DbRef.hub.update(hub);

        // STARTUP
        REST.setAccessToken(hub.accessToken);
      }
      catch(e) {
        if (e && e.status && e.status === 401) { eventBus.emit(topics.COULD_NOT_LOG_IN); break; }
        console.log("Error in login to cloud",e); await Util.wait(RETRY_INTERVAL_MS);
      }
    }
    this.loginInProgress = false;
  }


  async sync() {
    if (this.syncInProgress === true) { return; }
    this.syncInProgress = true;

    // download stones from sphere, load in memory
    let stonesSynced = false;
    while (stonesSynced === false && this.resetTriggered === false) {
      try {
        let stones : CloudStoneData[] = await REST.forSphere(this.sphereId).getStonesInSphere()
        if (stones) { MemoryDb.loadCloudStoneData(stones); }
        stonesSynced = true;
      }
      catch(e) { console.log("Error in sync", e); await Util.wait(RETRY_INTERVAL_MS); }
    }

    let usersObtained = false;
    while (usersObtained === false && this.resetTriggered === false) {
      try {
        let sphereUsers : CloudSphereUsers = await REST.forSphere(this.sphereId).getUsers();
        let tokenSets : CloudAuthorizationTokens = await REST.forSphere(this.sphereId).getSphereAuthorizationTokens();
        usersObtained = true;
        await DbRef.user.merge(sphereUsers, tokenSets);
      }
      catch(e) { console.log("Error in sync user obtaining", e); await Util.wait(RETRY_INTERVAL_MS); }
    }

    this.syncInProgress = false;
  }



  async setupSSE(hub: Hub) {
    if (this.sseSetupInprogress === true) { return; }
    this.sseSetupInprogress = true;

    if (this.sse === null) {
      this.sse = new CrownstoneSSE({hubLoginBase: 'http://localhost:3000/api/Hubs/'});
    }

    let sseLoggedIn = false;
    while (sseLoggedIn == false && this.resetTriggered === false) {
      try      { await this.sse.hubLogin(hub.cloudId, hub.token); sseLoggedIn = true; }
      catch(e) {
        if (e && e.status && e.status === 401) { eventBus.emit(topics.COULD_NOT_LOG_IN); break; }
        console.log("Error in SSE", e); await Util.wait(RETRY_INTERVAL_MS);
      }
    }

    this.sse.start(this.sseEventHandler.handleSseEvent)

    this.sseSetupInprogress = false;
  }
}


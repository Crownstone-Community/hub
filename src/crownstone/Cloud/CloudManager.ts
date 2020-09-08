import {CrownstoneCloud, REST} from 'crownstone-cloud';
import {CrownstoneSSE} from 'crownstone-sse';
import {DbRef} from '../Data/DbReference';
import {Hub} from '../../models/hub.model';
import {MemoryDb} from '../Data/MemoryDb';
import {Util} from '../../util/Util';
import {SseEventHandler} from './SseEventHandler';
import {eventBus} from '../EventBus';
import {topics} from '../topics';
import Timeout = NodeJS.Timeout;

const os = require('os');
const LOG = require('debug-level')('crownstone-hub-cloud')

const RETRY_INTERVAL_MS = 5000;



export class CloudManager {
  cloud           : CrownstoneCloud;
  sse             : CrownstoneSSE | null = null;
  sseEventHandler : SseEventHandler;

  initializeInProgress = false;
  loginInProgress = false;
  syncInProgress = false;
  sseSetupInprogress = false;
  ipUpdateInprogress = false;

  sphereId: string;
  eventsRegistered = false;

  resetTriggered = false;
  storedIpAddress : string | null = null;

  intervalsRegistered = false;
  interval_sync : Timeout | null = null;
  interval_ip   : Timeout | null = null;

  constructor() {
    this.cloud = new CrownstoneCloud("https://cloud.crownstone.rocks/api/")
    this.sseEventHandler = new SseEventHandler();

    this.setupEvents();


  }

  setupEvents() {
    if (this.eventsRegistered === false) {
      eventBus.on(topics.HUB_CREATED,         () => { this.initialize(); });
      eventBus.on(topics.TOKEN_EXPIRED,       () => { this.initialize(); });
      eventBus.on(topics.CLOUD_SYNC_REQUIRED, () => { this.sync();       });
      this.eventsRegistered = true;
    }
  }

  async cleanup() {
    LOG.debug("Cloudmanager cleanup started.");
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

    if (this.interval_sync !== null && this.interval_ip !== null) {
      clearInterval(this.interval_ip)
      clearInterval(this.interval_sync)
    }
    this.intervalsRegistered = false;

    LOG.debug("Cloudmanager cleanup finished.");
  }


  async initialize() {
    await this.updateLocalIp()

    if (this.initializeInProgress === true) { return; }
    LOG.info("Cloudmanager initialize started.");
    this.initializeInProgress = true;
    let hub = await DbRef.hub.get();
    if (hub) {
      await this.login(hub);
      await this.setupSSE(hub);
      await this.sync();
      await this.updateLocalIp();

      if (this.intervalsRegistered === false) {
        this.intervalsRegistered = true;
        this.interval_ip   = setInterval(() => { this.updateLocalIp(); }, 15*60*1000); // every 15 minutes
        this.interval_sync = setInterval(() => { this.sync();          }, 60*60*1000); // every 60 minutes
      }
    }
    else {
      console.log("No hub data yet")
    }
    LOG.info("Cloudmanager initialize finished.");

    this.initializeInProgress = false;
  }



  async login(hub: Hub) {
    if (this.loginInProgress === true) { return; }
    LOG.info("Cloudmanager LOGIN started.");
    this.loginInProgress = true;

    this.sphereId = hub.sphereId;

    // LOGIN:
    let cloudLoggedIn = false;
    while (cloudLoggedIn === false && this.resetTriggered === false) {
      try      {
        let loginData = await this.cloud.hubLogin(hub.cloudId, hub.token);
        cloudLoggedIn = true;
        hub.accessToken = loginData.accessToken;
        hub.accessTokenExpiration = new Date((loginData.ttl*1000) + new Date().valueOf());
        await DbRef.hub.update(hub);
      }
      catch(e) {
        if (e && e.status && e.status === 401) { eventBus.emit(topics.COULD_NOT_LOG_IN); break; }
        LOG.warn("Error in login to cloud",e); await Util.wait(RETRY_INTERVAL_MS);
      }
    }
    this.loginInProgress = false;
    LOG.info("Cloudmanager LOGIN finished.");
  }



  async sync() {
    if (this.syncInProgress === true) { return; }
    LOG.info("Cloudmanager SYNC started.");
    this.syncInProgress = true;
    // download stones from sphere, load in memory
    let stonesSynced = false;

    // while (stonesSynced === false && this.resetTriggered === false) {
    //   try {
    //     let stones : CloudStoneData[] = await this.cloud.sphereById(this.sphereId).crownstones().refresh().data();
    //     if (stones) { MemoryDb.loadCloudStoneData(stones); }
    //     stonesSynced = true;
    //   }
    //   catch(e) { console.log("Error in sync", e); await Util.wait(RETRY_INTERVAL_MS); }
    // }
    // let usersObtained = false;
    //
    // while (usersObtained === false && this.resetTriggered === false) {
    //   try {
    //     let sphereUsers : CloudSphereUsers = await REST.forSphere(this.sphereId).getUsers();
    //     let tokenSets : CloudAuthorizationTokens = await REST.forSphere(this.sphereId).getSphereAuthorizationTokens();
    //     usersObtained = true;
    //     await DbRef.user.merge(sphereUsers, tokenSets);
    //   }
    //   catch(e) { LOG.warn("Error in sync user obtaining", e); await Util.wait(RETRY_INTERVAL_MS); }
    // }

    LOG.info("Cloudmanager SYNC finished.");
    this.syncInProgress = false;
  }



  async setupSSE(hub: Hub) {
    if (this.sseSetupInprogress === true) { return; }
    this.sseSetupInprogress = true;
    LOG.info("Cloudmanager SSE setup started.");
    if (this.sse === null) {
      this.sse = new CrownstoneSSE({hubLoginBase: 'https://cloud.crownstone.rocks/api/Hubs/', autoreconnect: false});
    }

    let sseLoggedIn = false;
    while (sseLoggedIn == false && this.resetTriggered === false) {
      try      { await this.sse.hubLogin(hub.cloudId, hub.token); sseLoggedIn = true; }
      catch(e) {
        if (e && e.status && e.status === 401) { eventBus.emit(topics.COULD_NOT_LOG_IN); break; }
        LOG.warn("Error in SSE", e); await Util.wait(RETRY_INTERVAL_MS);
      }
    }

    this.sse.start(this.sseEventHandler.handleSseEvent)
    LOG.info("Cloudmanager SSE setup finished.");
    this.sseSetupInprogress = false;
  }


  async updateLocalIp() {
    if (this.ipUpdateInprogress === false) { return; }

    LOG.info("Cloudmanager IP update started.");
    this.ipUpdateInprogress = true;

    let ifaces = os.networkInterfaces();
    let ips = ''
    Object.keys(ifaces).forEach(function(ifname) {
      let alias = 0;

      ifaces[ifname].forEach(function(iface: any) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }

        // avoid self allocated ip address
        if (iface.address && iface.address.indexOf("169.254.") === -1) {
          ips += iface.address + ';'
        }

        ++alias;
      });
    });

    // remove trailing ;
    if (ips.length > 0) {
      ips = ips.substr(0, ips.length - 1)
    }

    if (ips && this.storedIpAddress !== ips) {
      let ipUpdated = false;
      while (ipUpdated == false && this.resetTriggered === false) {
        try {
          await REST.updateHubIP(ips);
          this.storedIpAddress = ips;
          ipUpdated = true;
        } catch (e) {
          LOG.warn("Error updating localI IP address", e);
        }
      }
    }
    LOG.info("Cloudmanager IP update finished.");
    this.ipUpdateInprogress = false;
  }
}


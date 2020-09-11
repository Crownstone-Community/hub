"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudManager = void 0;
const crownstone_cloud_1 = require("crownstone-cloud");
const crownstone_sse_1 = require("crownstone-sse");
const DbReference_1 = require("../Data/DbReference");
const MemoryDb_1 = require("../Data/MemoryDb");
const Util_1 = require("../../util/Util");
const SseEventHandler_1 = require("./SseEventHandler");
const EventBus_1 = require("../EventBus");
const topics_1 = require("../topics");
const os = require('os');
const LOG = require('debug-level')('crownstone-hub-cloud');
const RETRY_INTERVAL_MS = 5000;
class CloudManager {
    constructor() {
        this.sse = null;
        this.initializeInProgress = false;
        this.initialized = false;
        this.loginInProgress = false;
        this.syncInProgress = false;
        this.sseSetupInprogress = false;
        this.ipUpdateInprogress = false;
        this.eventsRegistered = false;
        this.resetTriggered = false;
        this.storedIpAddress = null;
        this.intervalsRegistered = false;
        this.interval_sync = null;
        this.interval_ip = null;
        this.cloud = new crownstone_cloud_1.CrownstoneCloud("https://cloud.crownstone.rocks/api/");
        this.sseEventHandler = new SseEventHandler_1.SseEventHandler();
        this.setupEvents();
    }
    setupEvents() {
        if (this.eventsRegistered === false) {
            EventBus_1.eventBus.on(topics_1.topics.HUB_CREATED, () => { this.initialize(); });
            EventBus_1.eventBus.on(topics_1.topics.TOKEN_EXPIRED, () => { this.initialize(); });
            EventBus_1.eventBus.on(topics_1.topics.CLOUD_SYNC_REQUIRED, () => { this.sync(); });
            this.eventsRegistered = true;
        }
    }
    async cleanup() {
        LOG.debug("Cloudmanager cleanup started.");
        this.resetTriggered = true;
        // wait for everything to clean up.
        while (this.initializeInProgress || this.loginInProgress || this.sseSetupInprogress || this.syncInProgress) {
            await Util_1.Util.wait(100);
        }
        this.initialized = false;
        this.resetTriggered = false;
        // @ts-ignore
        this.sphereId = null;
        if (this.sse) {
            this.sse.stop();
            this.sse = null;
        }
        if (this.interval_sync !== null && this.interval_ip !== null) {
            clearInterval(this.interval_ip);
            clearInterval(this.interval_sync);
        }
        this.intervalsRegistered = false;
        LOG.debug("Cloudmanager cleanup finished.");
    }
    async initialize() {
        if (this.initializeInProgress === true) {
            return;
        }
        // The hub can never be not trying to connect unless it has no database reference to the hub itself.
        this.initializeInProgress = true;
        let hub = await DbReference_1.DbRef.hub.get();
        if (hub) {
            // we have a hub database entry. We will continue to retry to initialize until we either succeed or the hub
            while (this.initialized === false) {
                let hub = await DbReference_1.DbRef.hub.get();
                if (!hub) {
                    break;
                }
                LOG.info("Cloudmanager initialize started.");
                try {
                    await this.login(hub);
                    await this.setupSSE(hub);
                    await this.sync();
                    await this.updateLocalIp();
                    if (this.intervalsRegistered === false) {
                        this.intervalsRegistered = true;
                        if (this.interval_sync !== null && this.interval_ip !== null) {
                            clearInterval(this.interval_ip);
                            clearInterval(this.interval_sync);
                        }
                        this.interval_ip = setInterval(() => { this.updateLocalIp(); }, 15 * 60 * 1000); // every 15 minutes
                        this.interval_sync = setInterval(() => {
                            this.sync().catch(async (err) => {
                                if (err === 401) {
                                    await (this.recover(2000));
                                }
                            });
                        }, 60 * 60 * 1000); // every 60 minutes
                        this.initialized = true;
                    }
                }
                catch (err) {
                    LOG.warn("We could not initialize the Cloud manager. Maybe this hub or sphere has been removed from the cloud?", err);
                    EventBus_1.eventBus.emit(topics_1.topics.CLOUD_AUTHENTICATION_PROBLEM_401);
                    this.initialized = false;
                }
            }
        }
        else {
            LOG.info("No hub data yet");
        }
        LOG.info("Cloudmanager initialize finished.");
        this.initializeInProgress = false;
    }
    async recover(delayMs = 500) {
        await this.cleanup();
        await Util_1.Util.wait(delayMs);
        while (this.initializeInProgress) {
            await Util_1.Util.wait(2000);
        }
        await this.initialize();
    }
    async login(hub) {
        if (this.loginInProgress === true) {
            return;
        }
        LOG.info("Cloudmanager LOGIN started.");
        this.loginInProgress = true;
        this.sphereId = hub.sphereId;
        // LOGIN:
        let cloudLoggedIn = false;
        while (cloudLoggedIn === false && this.resetTriggered === false) {
            try {
                let loginData = await this.cloud.hubLogin(hub.cloudId, hub.token);
                cloudLoggedIn = true;
                hub.accessToken = loginData.accessToken;
                hub.accessTokenExpiration = new Date((loginData.ttl * 1000) + Date.now());
                await DbReference_1.DbRef.hub.update(hub);
            }
            catch (e) {
                LOG.warn("Error in login to cloud", e);
                // we can get a 401 if a sphere is deleted, or if our hub entity is deleted (and it's tokens removed)
                // Both scenarios are equally breaking to a hub. We will unlink the cloud connection and attempt re-initialization.
                if (e && e.statusCode && e.statusCode === 401) {
                    throw 401;
                }
                await Util_1.Util.wait(RETRY_INTERVAL_MS);
            }
        }
        this.loginInProgress = false;
        LOG.info("Cloudmanager LOGIN finished.");
    }
    async sync() {
        if (this.syncInProgress === true) {
            return;
        }
        LOG.info("Cloudmanager SYNC started.");
        this.syncInProgress = true;
        // download stones from sphere, load in memory
        let stonesSynced = false;
        while (stonesSynced === false && this.resetTriggered === false) {
            try {
                let stones = await this.cloud.sphere(this.sphereId).crownstones();
                if (stones) {
                    MemoryDb_1.MemoryDb.loadCloudStoneData(stones);
                }
                stonesSynced = true;
            }
            catch (e) {
                // we can get a 401 if a sphere is deleted, out accessToken has expired, or if our hub entity is deleted (and it's tokens removed)
                // Both scenarios are equally breaking to a hub. We will unlink the cloud connection and attempt re-initialization.
                LOG.warn("Error in sync", e);
                if (e && e.statusCode && e.statusCode === 401) {
                    throw 401;
                }
                await Util_1.Util.wait(RETRY_INTERVAL_MS);
            }
        }
        let usersObtained = false;
        while (usersObtained === false && this.resetTriggered === false) {
            try {
                let sphereUsers = await this.cloud.sphere(this.sphereId).users();
                let tokenSets = await this.cloud.sphere(this.sphereId).authorizationTokens();
                usersObtained = true;
                await DbReference_1.DbRef.user.merge(sphereUsers, tokenSets);
            }
            catch (e) {
                // we can get a 401 if a sphere is deleted, out accessToken has expired, or if our hub entity is deleted (and it's tokens removed)
                // Both scenarios are equally breaking to a hub. We will unlink the cloud connection and go back to un-initialized state.
                LOG.warn("Error in sync user obtaining", e);
                if (e && e.statusCode && e.statusCode === 401) {
                    throw 401;
                }
                await Util_1.Util.wait(RETRY_INTERVAL_MS);
            }
        }
        LOG.info("Cloudmanager SYNC finished.");
        this.syncInProgress = false;
    }
    async setupSSE(hub) {
        if (this.sseSetupInprogress === true) {
            return;
        }
        this.sseSetupInprogress = true;
        LOG.info("Cloudmanager SSE setup started.");
        if (this.sse === null) {
            this.sse = new crownstone_sse_1.CrownstoneSSE({ hubLoginBase: 'https://cloud.crownstone.rocks/api/Hubs/', autoreconnect: false });
        }
        let sseLoggedIn = false;
        while (sseLoggedIn == false && this.resetTriggered === false) {
            try {
                await this.sse.hubLogin(hub.cloudId, hub.token);
                sseLoggedIn = true;
            }
            catch (e) {
                LOG.warn("Error in SSE", e);
                // we can get a 401 if a sphere is deleted, out accessToken has expired, or if our hub entity is deleted (and it's tokens removed)
                // Both scenarios are equally breaking to a hub. We will unlink the cloud connection and go back to un-initialized state.
                if (e && e.statusCode && e.statusCode === 401) {
                    throw 401;
                }
                await Util_1.Util.wait(RETRY_INTERVAL_MS);
            }
        }
        this.sse.start(this.sseEventHandler.handleSseEvent);
        LOG.info("Cloudmanager SSE setup finished.");
        this.sseSetupInprogress = false;
    }
    async updateLocalIp() {
        if (this.ipUpdateInprogress === false) {
            return;
        }
        LOG.info("Cloudmanager IP update started.");
        this.ipUpdateInprogress = true;
        let ifaces = os.networkInterfaces();
        let ips = '';
        Object.keys(ifaces).forEach(function (ifname) {
            let alias = 0;
            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }
                // avoid self allocated ip address
                if (iface.address && iface.address.indexOf("169.254.") === -1) {
                    ips += iface.address + ';';
                }
                ++alias;
            });
        });
        // remove trailing ;
        if (ips.length > 0) {
            ips = ips.substr(0, ips.length - 1);
        }
        if (ips && this.storedIpAddress !== ips) {
            let ipUpdated = false;
            while (ipUpdated == false && this.resetTriggered === false) {
                try {
                    await this.cloud.hub().setLocalIpAddress(ips);
                    this.storedIpAddress = ips;
                    ipUpdated = true;
                }
                catch (e) {
                    LOG.warn("Error updating localI IP address", e);
                }
            }
        }
        LOG.info("Cloudmanager IP update finished.");
        this.ipUpdateInprogress = false;
    }
}
exports.CloudManager = CloudManager;
//# sourceMappingURL=CloudManager.js.map
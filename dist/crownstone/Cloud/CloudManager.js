"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudManager = void 0;
const crownstone_cloud_1 = require("crownstone-cloud");
const crownstone_sse_1 = require("crownstone-sse");
const DbReference_1 = require("../data/DbReference");
const MemoryDb_1 = require("../data/MemoryDb");
const Util_1 = require("../../util/Util");
const SseEventHandler_1 = require("./SseEventHandler");
const HubEventBus_1 = require("../HubEventBus");
const topics_1 = require("../topics");
const Logger_1 = require("../../Logger");
const HubStatus_1 = require("../HubStatus");
const HubUtil_1 = require("../../util/HubUtil");
const ConfigUtil_1 = require("../../util/ConfigUtil");
const CrownstoneUtil_1 = require("../CrownstoneUtil");
const log = Logger_1.Logger(__filename);
const RETRY_INTERVAL_MS = 5000;
class CloudManager {
    constructor() {
        this.sse = null;
        this.initializeInProgress = false;
        this.retryInitialization = false;
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
            HubEventBus_1.eventBus.on(topics_1.topics.TOKEN_EXPIRED, () => { this.initialize(); });
            HubEventBus_1.eventBus.on(topics_1.topics.CLOUD_SYNC_REQUIRED, () => { this.sync(); });
            this.eventsRegistered = true;
        }
    }
    async cleanup() {
        log.debug("Cloudmanager cleanup started.");
        this.resetTriggered = true;
        // wait for everything to clean up.
        let iteration = 0;
        while (this.initializeInProgress || this.loginInProgress || this.sseSetupInprogress || this.syncInProgress) {
            if (this.initializeInProgress) {
                log.info("Waiting on this.initializeInProgress");
            }
            if (this.loginInProgress) {
                log.info("Waiting on this.loginInProgress");
            }
            if (this.sseSetupInprogress) {
                log.info("Waiting on this.sseSetupInprogress");
            }
            if (this.syncInProgress) {
                log.info("Waiting on this.syncInProgress");
            }
            await Util_1.Util.wait(100);
            iteration++;
            if (iteration > 1000) {
                log.critical("Destroy hub instance. Stuck in syncing loop.");
                process.exit();
            }
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
        log.debug("Cloudmanager cleanup finished.");
    }
    async initialize() {
        if (this.initializeInProgress === true) {
            log.info("Cloudmanager has requested a second initialization.");
            this.retryInitialization = true;
            return;
        }
        log.info("CloudManager initialization starting...");
        this.storedIpAddress = null;
        this.initialized = false;
        this.retryInitialization = false;
        this.initializeInProgress = true;
        HubStatus_1.HubStatus.loggedIntoCloud = false;
        HubStatus_1.HubStatus.loggedIntoSSE = false;
        HubStatus_1.HubStatus.syncedWithCloud = false;
        // The hub can never be not trying to connect unless it has no database reference to the hub itself.
        if (await DbReference_1.Dbs.hub.isSet() !== false) {
            // we have a hub database entry. We will continue to retry to initialize until we either succeed or the hub
            let iterations = 0;
            while (this.initialized === false) {
                let hub = await DbReference_1.Dbs.hub.get();
                if (!hub) {
                    break;
                }
                if (hub.cloudId === 'null') {
                    throw 401;
                }
                log.info("Cloudmanager initialize started.", iterations);
                iterations++;
                try {
                    try {
                        await this.login(hub);
                    }
                    catch (e) {
                        log.warn("Could not log into the cloud...", e);
                        if (e === 401) {
                            this.initializeInProgress = false;
                            await CrownstoneUtil_1.CrownstoneUtil.deleteCrownstoneHub(true, true);
                            throw e;
                        }
                    }
                    await this.setupSSE(hub);
                    await this.sync();
                    // TODO: download last known datapoints to get an offset for energy samples
                    await this.updateLocalIp();
                    if (this.intervalsRegistered === false) {
                        this.intervalsRegistered = true;
                        if (this.interval_sync !== null && this.interval_ip !== null) {
                            clearInterval(this.interval_ip);
                            clearInterval(this.interval_sync);
                        }
                        this.interval_ip = setInterval(() => { this.updateLocalIp(); }, 15 * 60 * 1000); // every 15 minutes
                        this.interval_sync = setInterval(async () => {
                            await this.sync().catch(async (err) => {
                                if (err === 401) {
                                    await (this.recover(2000));
                                }
                            });
                        }, 60 * 60 * 1000); // every 60 minutes
                    }
                    this.initialized = true;
                }
                catch (err) {
                    log.warn("We could not initialize the Cloud manager. Maybe this hub or sphere has been removed from the cloud?", err);
                    HubEventBus_1.eventBus.emit(topics_1.topics.CLOUD_AUTHENTICATION_PROBLEM_401);
                    this.initialized = false;
                    if (err == 401) {
                        throw err;
                    }
                }
            }
        }
        else {
            log.info("No hub data yet");
        }
        log.info("Cloudmanager initialize finished.");
        this.initializeInProgress = false;
        if (this.retryInitialization) {
            log.info("Waiting to start a second initialization...");
            await Util_1.Util.wait(5000);
            log.info("Executing a second initialization...");
            await this.initialize();
        }
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
        log.info("Cloudmanager login started.");
        this.loginInProgress = true;
        this.sphereId = hub.sphereId;
        // login:
        try {
            let cloudLoggedIn = false;
            while (cloudLoggedIn === false && this.resetTriggered === false) {
                try {
                    let loginData = await this.cloud.hubLogin(hub.cloudId, hub.token);
                    cloudLoggedIn = true;
                    hub.accessToken = loginData.accessToken;
                    hub.accessTokenExpiration = new Date((loginData.ttl * 1000) + Date.now());
                    await DbReference_1.Dbs.hub.update(hub);
                }
                catch (e) {
                    log.warn("Error in login to cloud", e);
                    HubStatus_1.HubStatus.loggedIntoCloud = false;
                    // we can get a 401 if a sphere is deleted, or if our hub entity is deleted (and it's tokens removed)
                    // Both scenarios are equally breaking to a hub. We will unlink the cloud connection and attempt re-initialization.
                    if (e && e.statusCode && e.statusCode === 401) {
                        throw 401;
                    }
                    await Util_1.Util.wait(RETRY_INTERVAL_MS);
                }
            }
            HubStatus_1.HubStatus.loggedIntoCloud = true;
            log.info("Cloudmanager login finished.");
            this.loginInProgress = false;
        }
        catch (e) {
            log.warn("Login failed...", e);
            this.loginInProgress = false;
            await Util_1.Util.wait(RETRY_INTERVAL_MS);
            throw e;
        }
    }
    async sync() {
        if (this.syncInProgress === true) {
            return;
        }
        log.info("Cloudmanager SYNC started.");
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
                HubStatus_1.HubStatus.syncedWithCloud = false;
                // we can get a 401 if a sphere is deleted, out accessToken has expired, or if our hub entity is deleted (and it's tokens removed)
                // Both scenarios are equally breaking to a hub. We will unlink the cloud connection and attempt re-initialization.
                log.warn("Error in sync", e);
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
                await DbReference_1.Dbs.user.merge(sphereUsers, tokenSets);
            }
            catch (e) {
                HubStatus_1.HubStatus.syncedWithCloud = false;
                // we can get a 401 if a sphere is deleted, out accessToken has expired, or if our hub entity is deleted (and it's tokens removed)
                // Both scenarios are equally breaking to a hub. We will unlink the cloud connection and go back to un-initialized state.
                log.warn("Error in sync user obtaining", e);
                if (e && e.statusCode && e.statusCode === 401) {
                    throw 401;
                }
                await Util_1.Util.wait(RETRY_INTERVAL_MS);
            }
        }
        let locationsSynced = false;
        while (locationsSynced === false && this.resetTriggered === false) {
            try {
                let locations = await this.cloud.sphere(this.sphereId).locations();
                if (locations) {
                    MemoryDb_1.MemoryDb.loadCloudLocationData(locations);
                }
                locationsSynced = true;
            }
            catch (e) {
                HubStatus_1.HubStatus.syncedWithCloud = false;
                // we can get a 401 if a sphere is deleted, out accessToken has expired, or if our hub entity is deleted (and it's tokens removed)
                // Both scenarios are equally breaking to a hub. We will unlink the cloud connection and attempt re-initialization.
                log.warn("Error in sync", e);
                if (e && e.statusCode && e.statusCode === 401) {
                    throw 401;
                }
                await Util_1.Util.wait(RETRY_INTERVAL_MS);
            }
        }
        HubStatus_1.HubStatus.syncedWithCloud = true;
        log.info("Cloudmanager SYNC finished.");
        this.syncInProgress = false;
    }
    async setupSSE(hub) {
        if (this.sseSetupInprogress === true) {
            return;
        }
        this.sseSetupInprogress = true;
        log.info("Cloudmanager SSE setup started.");
        if (this.sse === null) {
            this.sse = new crownstone_sse_1.CrownstoneSSE({ hubLoginBase: 'https://cloud.crownstone.rocks/api/Hubs/', autoreconnect: false });
        }
        let sseLoggedIn = false;
        while (sseLoggedIn == false && this.resetTriggered === false) {
            try {
                log.info("Logging into the SSE...");
                await this.sse.hubLogin(hub.cloudId, hub.token);
                sseLoggedIn = true;
                log.info("Login to SSE sucessful:", this.sse.accessToken);
            }
            catch (e) {
                log.warn("Error in SSE", e);
                HubStatus_1.HubStatus.loggedIntoSSE = false;
                // we can get a 401 if a sphere is deleted, out accessToken has expired, or if our hub entity is deleted (and it's tokens removed)
                // Both scenarios are equally breaking to a hub. We will unlink the cloud connection and go back to un-initialized state.
                if (e && e.statusCode && e.statusCode === 401) {
                    throw 401;
                }
                await Util_1.Util.wait(RETRY_INTERVAL_MS);
            }
        }
        log.info("Initializing the SSE with accessToken", this.sse.accessToken);
        this.sse.start(this.sseEventHandler.handleSseEvent);
        log.info("Cloudmanager SSE setup finished.");
        HubStatus_1.HubStatus.loggedIntoSSE = true;
        this.sseSetupInprogress = false;
    }
    async updateLocalIp() {
        if (this.ipUpdateInprogress === true) {
            return;
        }
        log.info("Cloudmanager IP update started.");
        this.ipUpdateInprogress = true;
        let ipAddress = HubUtil_1.getIpAddress();
        // we update the ip regardless of local change. WE DO NOT CARE IF ITS THE SAME. this method also updates external ip address and the last seen.
        if (ipAddress) {
            let ipUpdated = false;
            while (ipUpdated == false && this.resetTriggered === false) {
                try {
                    await this.cloud.hub().setLocalIpAddress(ipAddress, ConfigUtil_1.getHttpPort(), ConfigUtil_1.getHttpsPort());
                    this.storedIpAddress = ipAddress;
                    ipUpdated = true;
                }
                catch (e) {
                    if (e && e.statusCode && e.statusCode === 401) {
                        throw 401;
                    }
                    log.warn("Error updating local IP address", e);
                    await Util_1.Util.wait(RETRY_INTERVAL_MS);
                }
            }
        }
        log.info("Cloudmanager IP update finished.");
        this.ipUpdateInprogress = false;
    }
}
exports.CloudManager = CloudManager;
//# sourceMappingURL=CloudManager.js.map
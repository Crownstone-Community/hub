"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudManager = void 0;
const dist_1 = require("crownstone-sse/dist");
const crownstone_cloud_1 = require("crownstone-cloud");
const DbReference_1 = require("../Data/DbReference");
const MemoryDb_1 = require("../Data/MemoryDb");
const Util_1 = require("../../util/Util");
const SseEventHandler_1 = require("./SseEventHandler");
const EventBus_1 = require("../EventBus");
const RETRY_INTERVAL_MS = 5000;
class CloudManager {
    constructor() {
        this.sse = null;
        this.initializeInProgress = false;
        this.loginInProgress = false;
        this.syncInProgress = false;
        this.sseSetupInprogress = false;
        this.eventsRegistered = false;
        this.cloud = new crownstone_cloud_1.CrownstoneCloud("http://localhost:3000/api/");
        this.sseEventHandler = new SseEventHandler_1.SseEventHandler();
        this.setupEvents();
    }
    setupEvents() {
        if (this.eventsRegistered === false) {
            EventBus_1.eventBus.on("TOKEN_EXPIRED", () => { this.initialize(); });
            EventBus_1.eventBus.on("CLOUD_SYNC_REQUIRED", () => { this.sync(); });
            this.eventsRegistered = true;
        }
    }
    async initialize() {
        if (this.initializeInProgress === true) {
            return;
        }
        this.initializeInProgress = true;
        let hub = await DbReference_1.DbRef.hub.get();
        if (hub) {
            await this.login(hub);
            await this.setupSSE(hub);
            await this.sync();
        }
        else {
            console.log("No hub data yet");
        }
        this.initializeInProgress = false;
    }
    async login(hub) {
        if (this.loginInProgress === true) {
            return;
        }
        this.loginInProgress = true;
        this.sphereId = hub.sphereId;
        // LOGIN:
        // let cloudLoggedIn = false;
        // while (cloudLoggedIn === false) {
        //   try      { await this.cloud.hubLogin(hub.cloudId, hub.token); cloudLoggedIn = true; }
        //   catch(e) {
        //     if (e && e.status && e.status === 401) {
        //       eventBus.emit("COULD_NOT_LOG_IN");
        //     }
        //     console.log("Error in login to cloud",e); await Util.wait(RETRY_INTERVAL_MS); }
        // }
        // hub.accessToken = this.cloud.accessToken;
        // hub.accessTokenExpiration = this.cloud.accessTokenExpiration;
        // await DbRef.hub.update(hub);
        // STARTUP
        crownstone_cloud_1.REST.setAccessToken(hub.accessToken);
        this.loginInProgress = false;
    }
    async sync() {
        if (this.syncInProgress === true) {
            return;
        }
        this.syncInProgress = true;
        // download stones from sphere, load in memory
        let stonesSynced = false;
        while (stonesSynced === false) {
            try {
                let stones = await crownstone_cloud_1.REST.forSphere(this.sphereId).getStonesInSphere();
                if (stones) {
                    MemoryDb_1.MemoryDb.loadCloudStoneData(stones);
                }
                stonesSynced = true;
            }
            catch (e) {
                console.log("Error in sync", e);
                await Util_1.Util.wait(RETRY_INTERVAL_MS);
            }
        }
        let usersObtained = false;
        while (usersObtained === false) {
            try {
                let sphereUsers = await crownstone_cloud_1.REST.forSphere(this.sphereId).getUsers();
                let tokenSets = await crownstone_cloud_1.REST.forSphere(this.sphereId).getSphereAuthorizationTokens();
                usersObtained = true;
                await DbReference_1.DbRef.user.merge(sphereUsers, tokenSets);
            }
            catch (e) {
                console.log("Error in sync user obtaining", e);
                await Util_1.Util.wait(RETRY_INTERVAL_MS);
            }
        }
        // LOAD IN MONGO DB.
        this.syncInProgress = false;
    }
    async setupSSE(hub) {
        if (this.sseSetupInprogress === true) {
            return;
        }
        this.sseSetupInprogress = true;
        if (this.sse === null) {
            this.sse = new dist_1.CrownstoneSSE({ hubLoginBase: 'http://localhost:3000/api/Hubs/' });
        }
        let sseLoggedIn = false;
        while (sseLoggedIn == false) {
            try {
                await this.sse.hubLogin(hub.cloudId, hub.token);
                sseLoggedIn = true;
            }
            catch (e) {
                console.log("Error in SSE", e);
                await Util_1.Util.wait(RETRY_INTERVAL_MS);
            }
        }
        this.sse.start(this.sseEventHandler.handleSseEvent);
        this.sseSetupInprogress = false;
    }
}
exports.CloudManager = CloudManager;
//# sourceMappingURL=CloudManager.js.map
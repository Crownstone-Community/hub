"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uart = void 0;
const crownstone_uart_1 = require("crownstone-uart");
const PromiseManager_1 = require("./PromiseManager");
const HubEventBus_1 = require("../HubEventBus");
const config_1 = require("../../config");
const Logger_1 = require("../../Logger");
const topics_1 = require("../topics");
const UartHubDataCommunication_1 = require("./UartHubDataCommunication");
const DbReference_1 = require("../data/DbReference");
const CrownstoneUtil_1 = require("../CrownstoneUtil");
const HubStatusManager_1 = require("./HubStatusManager");
const FilterSyncer_1 = require("crownstone-core/dist/util/FilterSyncer");
const crownstone_core_1 = require("crownstone-core");
const FilterManager_1 = require("../filters/FilterManager");
const log = Logger_1.Logger(__filename);
class Uart {
    constructor(cloud) {
        this.ready = false;
        this.keyWasSet = false;
        this.refreshingKey = false;
        this.timeLastRefreshed = 0;
        this.queue = new PromiseManager_1.PromiseManager();
        this.cloud = cloud;
        this.connection = new crownstone_uart_1.CrownstoneUart();
        this.connection.hub.setMode("HUB");
        this.hubDataHandler = new UartHubDataCommunication_1.UartHubDataCommunication(this.connection);
        this.forwardEvents();
        // in case we reconnect, and have booted the hub (so the key was set), we try to sync the filters.
        this.connection.on(crownstone_uart_1.UartTopics.ConnectionEstablished, () => {
            log.notice("UART connection established. Keys are set:", this.keyWasSet);
            if (this.keyWasSet) {
                this.syncFilters();
            }
        });
    }
    forwardEvents() {
        // generate a list of topics that can be remapped from connection to lib.
        let eventsToForward = [
            { uartTopic: crownstone_uart_1.UartTopics.MeshServiceData, hubTopic: topics_1.topics.MESH_SERVICE_DATA },
            { uartTopic: crownstone_uart_1.UartTopics.TopologyUpdate, hubTopic: topics_1.topics.MESH_TOPOLOGY },
            { uartTopic: crownstone_uart_1.UartTopics.AssetMacReport, hubTopic: topics_1.WebhookInternalTopics.__ASSET_REPORT },
            { uartTopic: crownstone_uart_1.UartTopics.NearstCrownstoneTrackingUpdate, hubTopic: topics_1.WebhookInternalTopics.__ASSET_TRACKING_UPDATE },
            { uartTopic: crownstone_uart_1.UartTopics.NearstCrownstoneTrackingTimeout, hubTopic: topics_1.WebhookInternalTopics.__ASSET_TRACKING_UPDATE_TIMEOUT },
        ];
        // forward all required events to the module eventbus.
        eventsToForward.forEach((event) => {
            let moduleEvent = event.hubTopic;
            if (!event.hubTopic) {
                moduleEvent = event.uartTopic;
            }
            this.connection.on(event.uartTopic, (data) => {
                HubEventBus_1.eventBus.emit(moduleEvent, data);
            });
        });
        this.connection.on(crownstone_uart_1.UartTopics.HubDataReceived, (data) => { this.hubDataHandler.handleIncomingHubData(data); });
        this.connection.on(crownstone_uart_1.UartTopics.KeyRequested, () => { log.info("Uart is requesting a key"); this.refreshUartEncryption(); });
        this.connection.on(crownstone_uart_1.UartTopics.DecryptionFailed, () => { log.info("Uart failed to decrypt. Refresh key."); this.refreshUartEncryption(); });
    }
    async _initialize() {
        try {
            await this.connection.start(config_1.CONFIG.uartPort);
            await HubStatusManager_1.HubStatusManager.setStatus({
                clientHasBeenSetup: false,
                encryptionRequired: false,
                clientHasInternet: false,
            });
            log.info("Uart is ready");
            this.ready = true;
        }
        catch (err) {
            this.ready = false;
            throw err;
        }
    }
    /**
     * This will directly return a promise, which will be resolved once uart is initialized.
     */
    async initialize() {
        this._initialized = this._initialize();
        return this._initialized;
    }
    async refreshUartEncryption() {
        try {
            if (this.refreshingKey === true) {
                return;
            }
            // throttle the refreshes...
            if (Date.now() - this.timeLastRefreshed < 5000) {
                return;
            }
            if (!DbReference_1.Dbs.hub) {
                console.log("noHub Db");
                return;
            }
            if (await DbReference_1.Dbs.hub.isSet() === false) {
                console.log("noHub");
                return;
            }
            this.refreshingKey = true;
            let hub = await DbReference_1.Dbs.hub.get();
            if (!hub) {
                this.refreshingKey = false;
                return;
            }
            if (hub.uartKey) {
                this.connection.encryption.setKey(hub.uartKey);
            }
            await CrownstoneUtil_1.CrownstoneUtil.checkLinkedStoneId();
            // this is done regardless since we might require a new key.
            let uartKey;
            try {
                uartKey = await this.cloud.hub().getUartKey();
            }
            catch (err) {
                log.warn("Could not obtain the uart key from the cloud...", err);
                this.refreshingKey = false;
                return;
            }
            hub = await DbReference_1.Dbs.hub.get();
            if (uartKey !== hub?.uartKey && hub) {
                hub.uartKey = uartKey;
                await DbReference_1.Dbs.hub.save(hub);
            }
            this.setUartKey(uartKey);
            this.refreshingKey = false;
            this.timeLastRefreshed = Date.now();
        }
        catch (err) {
            this.refreshingKey = false;
            throw err;
        }
    }
    setUartKey(key) {
        this.connection.encryption.setKey(key);
        this.keyWasSet = true;
    }
    async refreshMeshTopology() {
        return this.queue.register(() => {
            log.info("Dispatching refreshMeshTopology");
            return this.connection.mesh.refreshTopology();
        }, "refreshMeshTopology from Uart");
    }
    async switchCrownstones(switchPairs) {
        if (!this.ready) {
            throw "NOT_READY";
        }
        return this.queue.register(() => {
            log.info("Dispatching switchAction", switchPairs);
            return this.connection.switchCrownstones(switchPairs);
        }, "switchCrownstones from Uart" + JSON.stringify(switchPairs));
    }
    registerTrackedDevice(trackingNumber, locationUID, profileId, rssiOffset, ignoreForPresence, tapToToggleEnabled, deviceToken, ttlMinutes) {
        if (!this.ready) {
            throw "NOT_READY";
        }
        this.queue.register(() => {
            return this.connection.control.registerTrackedDevice(trackingNumber, locationUID, profileId, rssiOffset, ignoreForPresence, tapToToggleEnabled, deviceToken, ttlMinutes);
        });
    }
    async syncFilters(allowErrorRepair = true) {
        log.info("Preparing to sync filters over uart");
        let filterSet = await DbReference_1.Dbs.assetFilterSets.findOne();
        if (!filterSet) {
            throw "NO_FILTER_SET";
        }
        let filtersInSet = await DbReference_1.Dbs.assetFilters.find({ where: { filterSetId: filterSet.id } });
        let data = {
            masterVersion: filterSet.masterVersion,
            masterCRC: filterSet.masterCRC,
            filters: []
        };
        for (let filter of filtersInSet) {
            data.filters.push({
                idOnCrownstone: filter.idOnCrownstone,
                crc: parseInt(filter.dataCRC, 16),
                filter: Buffer.from(filter.data, 'hex')
            });
        }
        let receivedMasterVersion = null;
        let receivedMasterCRC = null;
        let commandInterface = {
            getSummaries: async () => {
                return this.queue.register(async () => {
                    log.info("Getting filter summaries");
                    let summaries = await this.connection.control.getFilterSummaries();
                    receivedMasterVersion = summaries.masterVersion;
                    receivedMasterCRC = summaries.masterCRC;
                    return summaries;
                }, "syncFilters from Uart");
            },
            remove: async (protocol, filterId) => {
                return this.queue.register(async () => {
                    log.info("Removing filter", filterId);
                    return this.connection.control.removeFilter(filterId);
                }, "syncFilters from Uart");
            },
            upload: async (protocol, filterData) => {
                return this.queue.register(async () => {
                    log.info("uploading filter");
                    return this.connection.control.uploadFilter(filterData.idOnCrownstone, filterData.filter);
                }, "syncFilters from Uart");
            },
            commit: async (protocol) => {
                return this.queue.register(async () => {
                    log.info("commiting filter changes");
                    // @ts-ignore
                    return this.connection.control.commitFilterChanges(filterSet.masterVersion, filterSet.masterCRC);
                }, "syncFilters from Uart");
            },
        };
        log.info("Starting to sync filters over uart");
        let syncer = new FilterSyncer_1.FilterSyncer(commandInterface, data);
        try {
            await syncer.syncToCrownstone();
        }
        catch (err) {
            switch (err) {
                case "TARGET_HAS_HIGHER_VERSION":
                    if (receivedMasterVersion) {
                        // set our version one higher than the one on the Crownstone.
                        filterSet.masterVersion = receivedMasterVersion + 1;
                        await DbReference_1.Dbs.assetFilterSets.update(filterSet);
                        return this.syncFilters();
                    }
                    else {
                        throw err;
                    }
                case "TARGET_HAS_SAME_VERSION_DIFFERENT_CRC":
                    // bump our version.
                    filterSet.masterVersion = crownstone_core_1.increaseMasterVersion(filterSet.masterVersion);
                    await DbReference_1.Dbs.assetFilterSets.update(filterSet);
                    return this.syncFilters();
                case crownstone_core_1.ResultValue.WRONG_STATE:
                case crownstone_core_1.ResultValue.MISMATCH:
                    if (allowErrorRepair) {
                        log.error("Error during filterSync", err);
                        log.notice("Attempting to repair error...");
                        // reconstruct all filters and sets.
                        await DbReference_1.Dbs.assetFilters.deleteAll();
                        await DbReference_1.Dbs.assetFilterSets.deleteAll();
                        await FilterManager_1.FilterManager.reconstructFilters();
                        await FilterManager_1.FilterManager.refreshFilterSets(filterSet.masterVersion, false);
                        log.notice("Retrying sync...");
                        return this.syncFilters(false);
                    }
                default:
                    throw err;
            }
        }
    }
}
exports.Uart = Uart;
//# sourceMappingURL=Uart.js.map
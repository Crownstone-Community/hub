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
const FilterUtil_1 = require("../filters/FilterUtil");
const log = Logger_1.Logger(__filename);
class Uart {
    constructor(cloud) {
        this.ready = false;
        this.refreshingKey = false;
        this.timeLastRefreshed = 0;
        this.queue = new PromiseManager_1.PromiseManager();
        this.cloud = cloud;
        this.connection = new crownstone_uart_1.CrownstoneUart();
        this.connection.hub.setMode("HUB");
        this.hubDataHandler = new UartHubDataCommunication_1.UartHubDataCommunication(this.connection);
        this.forwardEvents();
    }
    forwardEvents() {
        // generate a list of topics that can be remapped from connection to lib.
        let eventsToForward = [
            { uartTopic: crownstone_uart_1.UartTopics.MeshServiceData, moduleTopic: topics_1.topics.MESH_SERVICE_DATA },
            { uartTopic: crownstone_uart_1.UartTopics.AssetMacReport, moduleTopic: topics_1.WebhookInternalTopics.__ASSET_REPORT },
            { uartTopic: crownstone_uart_1.UartTopics.NearstCrownstoneTrackingUpdate, moduleTopic: topics_1.WebhookInternalTopics.__ASSET_TRACKING_UPDATE },
            { uartTopic: crownstone_uart_1.UartTopics.NearstCrownstoneTrackingTimeout, moduleTopic: topics_1.WebhookInternalTopics.__ASSET_TRACKING_UPDATE_TIMEOUT },
        ];
        // forward all required events to the module eventbus.
        eventsToForward.forEach((event) => {
            let moduleEvent = event.moduleTopic;
            if (!event.moduleTopic) {
                moduleEvent = event.uartTopic;
            }
            this.connection.on(event.uartTopic, (data) => { HubEventBus_1.eventBus.emit(moduleEvent, data); });
        });
        this.connection.on(crownstone_uart_1.UartTopics.HubDataReceived, (data) => { this.hubDataHandler.handleIncomingHubData(data); });
        this.connection.on(crownstone_uart_1.UartTopics.KeyRequested, () => { log.info("Uart is requesting a key"); this.refreshUartEncryption(); });
        this.connection.on(crownstone_uart_1.UartTopics.DecryptionFailed, () => { log.info("Uart failed to decrypt. Refresh key."); this.refreshUartEncryption(); });
    }
    async initialize() {
        try {
            await this.connection.start(config_1.CONFIG.uartPort);
            await HubStatusManager_1.HubStatusManager.setStatus({
                clientHasBeenSetup: false,
                encryptionRequired: false,
                clientHasInternet: false,
            });
            log.info("Uart is ready");
            // On initialization we check if the filters on the Crownstone match with the ones we expect.
            await this.syncFilters();
            this.ready = true;
        }
        catch (err) {
            this.ready = false;
            throw err;
        }
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
            this.timeLastRefreshed = Date.now();
            if (!DbReference_1.Dbs.hub) {
                return;
            }
            if (await DbReference_1.Dbs.hub.isSet() === false) {
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
            if (uartKey !== (hub === null || hub === void 0 ? void 0 : hub.uartKey) && hub) {
                hub.uartKey = uartKey;
                await DbReference_1.Dbs.hub.save(hub);
            }
            this.connection.encryption.setKey(uartKey);
            this.refreshingKey = false;
        }
        catch (err) {
            this.refreshingKey = false;
            throw err;
        }
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
    async syncFilters() {
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
                crc: parseInt(filter.dataCRC),
                metaData: FilterUtil_1.FilterUtil.getMetaData(filter),
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
                    return this.connection.control.uploadFilter(filterData.idOnCrownstone, filterData.metaData, filterData.filter);
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
                    filterSet.masterVersion = filterSet.masterVersion + 1;
                    await DbReference_1.Dbs.assetFilterSets.update(filterSet);
                    return this.syncFilters();
                default:
                    throw err;
            }
        }
    }
}
exports.Uart = Uart;
//# sourceMappingURL=Uart.js.map
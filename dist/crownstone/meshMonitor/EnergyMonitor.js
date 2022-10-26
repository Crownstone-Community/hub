"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyMonitor = void 0;
const DbReference_1 = require("../data/DbReference");
const MemoryDb_1 = require("../data/MemoryDb");
const CloudCommandHandler_1 = require("../cloud/CloudCommandHandler");
const Logger_1 = require("../../Logger");
const crownstone_core_1 = require("crownstone-core");
const EnergyProcessor_1 = require("../processing/EnergyProcessor");
const IntervalData_1 = require("../processing/IntervalData");
const InMemoryCache_1 = require("../data/InMemoryCache");
const log = (0, Logger_1.Logger)(__filename);
const PROCESSING_INTERVAL = 60000; // 1 minute;
const UPLOAD_INTERVAL = 60000; // 1 minute;
class EnergyMonitor {
    constructor() {
        this.energyIsProcessing = false;
        this.energyIsAggregating = false;
        this.processingPaused = false;
        this.aggregationProcessingPaused = false;
        this.uploadEnergyCache = new InMemoryCache_1.InMemoryCache(1000, async (data) => { this._uploadStoneEnergy(data); }, 'energyUploadMonitor');
        this.energyCache = new InMemoryCache_1.InMemoryCache(1000, async (data) => { await DbReference_1.Dbs.energy.createAll(data); }, 'energyMonitor');
    }
    init() {
        this.stop();
        // use this to batch the writes in the database.
        this.storeInterval = setInterval(async () => {
            await this.energyCache.store();
        }, 2000);
        this.timeInterval = setInterval(async () => {
            if (this.processingPaused === false) {
                this.processing().catch();
            }
        }, PROCESSING_INTERVAL * 1.1); // every 61 seconds.;
        this.uploadInterval = setInterval(async () => {
            this.uploadEnergyCache.store();
        }, UPLOAD_INTERVAL); // every 60 seconds.;
        // do the upload check initially.
        this.processing().catch();
    }
    stop() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        if (this.storeInterval) {
            clearInterval(this.storeInterval);
        }
        if (this.uploadInterval) {
            clearInterval(this.uploadInterval);
        }
    }
    pauseProcessing(seconds) {
        clearTimeout(this.pauseTimeout);
        this.processingPaused = true;
        this.pauseTimeout = setTimeout(() => { this.processingPaused = false; }, seconds * 1000);
    }
    pauseAggregationProcessing(seconds) {
        clearTimeout(this.aggregationPauseTimeout);
        this.aggregationProcessingPaused = true;
        this.aggregationPauseTimeout = setTimeout(() => { this.aggregationProcessingPaused = false; }, seconds * 1000);
    }
    resumeProcessing() {
        clearTimeout(this.pauseTimeout);
        this.processingPaused = false;
    }
    resumeAggregationProcessing() {
        clearTimeout(this.aggregationPauseTimeout);
        this.aggregationProcessingPaused = false;
    }
    async processing() {
        await this.processMeasurements();
        await this.processAggregations();
    }
    async processMeasurements(force = false) {
        if (this.energyIsProcessing || this.energyIsAggregating) {
            log.debug("Aggregation is already in progress. Aborting...");
            return;
        }
        if (this.processingPaused && !force) {
            log.debug("Reprocessing is being prepared. Aborting...");
            return;
        }
        await this.energyCache.store();
        this.energyIsProcessing = true;
        let iterationRequired = true;
        let iterationSize = 500;
        let count = 0;
        while (iterationRequired) {
            let energyData = await DbReference_1.Dbs.energy.find({ where: { processed: false }, limit: iterationSize, order: ['timestamp ASC'] });
            count += energyData.length;
            if (energyData.length === iterationSize) {
                iterationRequired = true;
            }
            else {
                iterationRequired = false;
            }
            // -------------------------------------------------------
            // sort in separate lists per stone.
            let stoneEnergy = {};
            if (energyData.length > 0) {
                for (let i = 0; i < energyData.length; i++) {
                    let energy = energyData[i];
                    if (stoneEnergy[energy.stoneUID] === undefined) {
                        stoneEnergy[energy.stoneUID] = [];
                    }
                    stoneEnergy[energy.stoneUID].push(energy);
                }
            }
            try {
                // handle it for each stone separately
                let stoneIds = Object.keys(stoneEnergy);
                for (let i = 0; i < stoneIds.length; i++) {
                    await this._processStoneEnergy(Number(stoneIds[i]), stoneEnergy[stoneIds[i]]);
                }
            }
            catch (e) {
                log.info("processMeasurements: Error in _processStoneEnergy", e);
                break;
            }
        }
        this.energyIsProcessing = false;
    }
    async processAggregations(force = false) {
        log.debug("Start processing Aggregations...");
        if (this.energyIsProcessing || this.energyIsAggregating) {
            log.debug("Processing is already running. Aborting...");
            return;
        }
        if (this.aggregationProcessingPaused && !force) {
            log.debug("Re-aggregation is being prepared. Aborting...");
            return;
        }
        this.energyIsAggregating = true;
        let uids = await DbReference_1.Dbs.energyProcessed.getStoneUIDs();
        for (let i = 0; i < uids.length; i++) {
            // get last known 5 minute interval datapoint
            let stoneUID = uids[i];
            let aggregationIntervals = Object.keys(IntervalData_1.IntervalData);
            for (let j = 0; j < aggregationIntervals.length; j++) {
                // @ts-ignore
                let intervalData = IntervalData_1.IntervalData[aggregationIntervals[j]];
                await this._processAggregations(stoneUID, intervalData);
            }
        }
        this.energyIsAggregating = false;
    }
    async _processAggregations(stoneUID, intervalData) {
        let lastPoint = await DbReference_1.Dbs.energyProcessed.findOne({ where: { stoneUID: stoneUID, interval: intervalData.targetInterval }, order: ['timestamp DESC'] });
        log.debug("Last point to start processing ", intervalData.targetInterval, "from:", lastPoint);
        let fromDate = lastPoint && lastPoint.timestamp || new Date(0);
        let iterationRequired = true;
        let iterationSize = 1000;
        let samples = [];
        while (iterationRequired) {
            samples = [];
            let processedPoints = await DbReference_1.Dbs.energyProcessed.find({ where: { stoneUID: stoneUID, interval: intervalData.basedOnInterval, timestamp: { gt: fromDate } }, limit: iterationSize, order: ['timestamp ASC'] });
            log.debug("Aggregating stone", stoneUID, "at", intervalData.targetInterval, "based on", intervalData.basedOnInterval, "from", fromDate, ":", processedPoints.length);
            if (processedPoints.length === iterationSize) {
                iterationRequired = true;
            }
            else {
                iterationRequired = false;
            }
            let previousPoint = null;
            for (let i = 0; i < processedPoints.length; i++) {
                let point = processedPoints[i];
                let timestamp = new Date(point.timestamp).valueOf();
                let isONsamplePoint = intervalData.isOnSamplePoint(timestamp);
                if (isONsamplePoint) {
                    samples.push({ stoneUID: stoneUID, energyUsage: point.energyUsage, timestamp: point.timestamp, uploaded: false, interval: intervalData.targetInterval });
                }
                else if (previousPoint) {
                    let previousTimestamp = new Date(previousPoint.timestamp).valueOf();
                    let previousSamplePointFromCurrent = intervalData.getPreviousSamplePoint(timestamp);
                    let previousSamplePointFromLast = intervalData.getPreviousSamplePoint(previousTimestamp);
                    // this means these items fall in the same bucket
                    if (previousSamplePointFromCurrent == previousSamplePointFromLast) {
                        // do nothing.
                    }
                    else {
                        // this means that the point exactly ON the datapoint is missing, but we have one before, and one after (a number?) of points.
                        let dt = timestamp - previousTimestamp;
                        let dJ = point.energyUsage - previousPoint.energyUsage;
                        let dJms = dJ / dt;
                        let elapsedSamplePoints = Math.ceil((previousSamplePointFromCurrent - previousSamplePointFromLast) / intervalData.sampleIntervalMs); // ms
                        // allow interpolation.
                        if (elapsedSamplePoints <= intervalData.interpolationThreshold) {
                            for (let j = 0; j < elapsedSamplePoints; j++) {
                                let samplePoint = previousSamplePointFromLast + (1 + j) * intervalData.sampleIntervalMs;
                                let dt = samplePoint - previousTimestamp;
                                let energyAtPoint = previousPoint.energyUsage + dt * dJms;
                                samples.push({ stoneUID: stoneUID, energyUsage: Math.round(energyAtPoint), timestamp: new Date(samplePoint), uploaded: false, interval: intervalData.targetInterval });
                            }
                        }
                    }
                }
                previousPoint = point;
            }
            if (previousPoint) {
                fromDate = previousPoint.timestamp;
            }
            await DbReference_1.Dbs.energyProcessed.createAll(samples);
        }
    }
    async _processStoneEnergy(stoneUID, energyData) {
        // we want at least 2 points to process.
        if (energyData.length === 0) {
            return;
        }
        let samples = [];
        // get the lastProcessed datapoint.
        let startFromIndex = 0;
        let lastDatapoint = await DbReference_1.Dbs.energy.findOne({ where: { stoneUID: stoneUID, timestamp: { lt: energyData[0].timestamp }, processed: true }, order: ['timestamp DESC'] });
        if (!lastDatapoint) {
            if (energyData.length < 2) {
                return;
            }
            startFromIndex = 1;
            lastDatapoint = energyData[0];
        }
        for (let i = startFromIndex; i < energyData.length; i++) {
            let datapoint = energyData[i];
            await (0, EnergyProcessor_1.processPair)(lastDatapoint, datapoint, { calculateSamplePoint: EnergyProcessor_1.minuteInterval, intervalMs: 60000 }, samples);
            lastDatapoint = datapoint;
        }
        if (samples.length > 0) {
            // all processed datapoints have been marked, except the last one, and possible the very first one. If we have samples, then the very first one has been used.
            // we mark it processed because of that.
            await DbReference_1.Dbs.energyProcessed.createAll(samples);
        }
    }
    collect(crownstoneId, accumulatedEnergy, powerUsage, timestamp) {
        this.energyCache.collect({
            stoneUID: crownstoneId,
            energyUsage: accumulatedEnergy,
            pointPowerUsage: powerUsage,
            timestamp: new Date(crownstone_core_1.Util.crownstoneTimeToTimestamp(timestamp)),
            processed: false
        });
        this.uploadEnergyCache.collect({
            stoneUID: crownstoneId,
            energyUsage: accumulatedEnergy,
            timestamp: new Date(crownstone_core_1.Util.crownstoneTimeToTimestamp(timestamp)),
        });
    }
    async _uploadStoneEnergy(measuredData) {
        if (this.uploadEnergyCache.cache.length > 0) {
            let dataToUpload = [];
            try {
                for (let datapoint of measuredData) {
                    let cloudId = MemoryDb_1.MemoryDb.stones[datapoint.stoneUID]?.cloudId;
                    if (!cloudId) {
                        continue;
                    }
                    dataToUpload.push({
                        stoneId: cloudId,
                        energy: datapoint.energyUsage,
                        t: datapoint.timestamp.toISOString(),
                    });
                }
            }
            catch (err) {
                throw new Error("COULD_NOT_PROCESS_DATA");
            }
            if (dataToUpload.length > 0) {
                return new Promise((resolve, reject) => {
                    CloudCommandHandler_1.CloudCommandHandler.addToQueue(async (CM) => {
                        try {
                            let permission = false;
                            try {
                                permission = await CM.cloud.sphere(CM.sphereId).getEnergyCollectionPermission();
                            }
                            catch (err) {
                                throw new Error("COULD_NOT_STORE");
                            }
                            if (permission) {
                                try {
                                    await CM.cloud.sphere(CM.sphereId).uploadEnergyData(dataToUpload);
                                }
                                catch (err) {
                                    throw new Error("FAILED_TO_STORE");
                                }
                            }
                            resolve();
                        }
                        catch (err) {
                            reject(err);
                        }
                    });
                });
            }
        }
    }
}
exports.EnergyMonitor = EnergyMonitor;
//# sourceMappingURL=EnergyMonitor.js.map
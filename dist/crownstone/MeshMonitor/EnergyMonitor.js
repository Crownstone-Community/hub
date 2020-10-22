"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyMonitor = void 0;
const DbReference_1 = require("../Data/DbReference");
const MemoryDb_1 = require("../Data/MemoryDb");
const CloudCommandHandler_1 = require("../Cloud/CloudCommandHandler");
const Logger_1 = require("../../Logger");
const crownstone_core_1 = require("crownstone-core");
const EnergyProcessor_1 = require("../Processing/EnergyProcessor");
const IntervalData_1 = require("../Processing/IntervalData");
const log = Logger_1.Logger(__filename);
const PROCESSING_INTERVAL = 60000; // 1 minute;
class EnergyMonitor {
    constructor() {
        this.energyIsProcessing = false;
        this.energyIsAggregating = false;
        this.processingPaused = false;
        this.aggregationProcessingPaused = false;
    }
    init() {
        this.stop();
        this.timeInterval = setInterval(() => {
            if (this.processingPaused === false) {
                this.processing().catch();
            }
        }, PROCESSING_INTERVAL * 1.1); // every 61 seconds.;
        // do the upload check initially.
        this.processing().catch();
    }
    stop() {
        if (this.timeInterval) {
            clearTimeout(this.timeInterval);
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
        // await this.uploadProcessed();
    }
    async processMeasurements() {
        if (this.energyIsProcessing || this.energyIsAggregating) {
            return;
        }
        this.energyIsProcessing = true;
        let iterationRequired = true;
        let iterationSize = 500;
        let count = 0;
        while (iterationRequired) {
            let energyData = await DbReference_1.DbRef.energy.find({ where: { processed: false }, limit: iterationSize, order: ['timestamp ASC'] });
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
    async processAggregations() {
        if (this.energyIsProcessing || this.energyIsAggregating) {
            return;
        }
        this.energyIsAggregating = true;
        let uids = await DbReference_1.DbRef.energyProcessed.getStoneUIDs();
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
        let lastPoint = await DbReference_1.DbRef.energyProcessed.findOne({ where: { stoneUID: stoneUID, interval: intervalData.targetInterval }, order: ['timestamp DESC'] });
        let fromDate = lastPoint && lastPoint.timestamp || new Date(0);
        let iterationRequired = true;
        let iterationSize = 500;
        let samples = [];
        while (iterationRequired) {
            let processedPoints = await DbReference_1.DbRef.energyProcessed.find({ where: { stoneUID: stoneUID, interval: intervalData.basedOnInterval, timestamp: { gt: fromDate } }, limit: iterationSize, order: ['timestamp ASC'] });
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
        }
        await DbReference_1.DbRef.energyProcessed.createAll(samples);
    }
    async uploadProcessed() {
        let processedData = await DbReference_1.DbRef.energyProcessed.find({ where: { uploaded: false } });
        try {
            await this._uploadStoneEnergy(processedData);
        }
        catch (e) {
            log.info("processMeasurements: Error in _uploadStoneEnergy", e);
        }
    }
    async _uploadStoneEnergy(processedData) {
        var _a;
        if (processedData.length > 0) {
            let hasData = false;
            let measurementData = {};
            let dataUploaded = [];
            for (let i = 0; i < processedData.length; i++) {
                let energy = processedData[i];
                // console.log(energy.stoneUID, MemoryDb.stones[energy.stoneUID]?.cloudId)
                let cloudId = (_a = MemoryDb_1.MemoryDb.stones[energy.stoneUID]) === null || _a === void 0 ? void 0 : _a.cloudId;
                if (cloudId) {
                    if (measurementData[cloudId] === undefined) {
                        measurementData[cloudId] = [];
                    }
                    hasData = true;
                    measurementData[cloudId].push({ t: energy.timestamp.valueOf(), energy: energy.energyUsage });
                    energy.uploaded = true;
                    dataUploaded.push(energy);
                }
            }
            if (hasData) {
                // console.log("I HAVE DATA TO UPLOAD", measurementData)
                CloudCommandHandler_1.CloudCommandHandler.addToQueue(async (CM) => {
                    await CM.cloud.hub().uploadEnergyMeasurements(measurementData);
                    for (let i = 0; i < dataUploaded.length; i++) {
                        await DbReference_1.DbRef.energyProcessed.update(dataUploaded[i]);
                    }
                });
            }
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
        let lastDatapoint = await DbReference_1.DbRef.energy.findOne({ where: { stoneUID: stoneUID, timestamp: { lt: energyData[0].timestamp }, processed: true }, order: ['timestamp DESC'] });
        if (!lastDatapoint) {
            if (energyData.length < 2) {
                return;
            }
            startFromIndex = 1;
            lastDatapoint = energyData[0];
        }
        for (let i = startFromIndex; i < energyData.length; i++) {
            let datapoint = energyData[i];
            await EnergyProcessor_1.processPair(lastDatapoint, datapoint, { calculateSamplePoint: EnergyProcessor_1.minuteInterval, intervalMs: 60000 }, samples);
            lastDatapoint = datapoint;
        }
        if (samples.length > 0) {
            // all processed datapoints have been marked, except the last one, and possible the very first one. If we have samples, then the very first one has been used.
            // we mark it processed because of that.
            await DbReference_1.DbRef.energyProcessed.createAll(samples);
        }
    }
    collect(crownstoneId, accumulatedEnergy, powerUsage, timestamp) {
        return DbReference_1.DbRef.energy.create({
            stoneUID: crownstoneId,
            energyUsage: accumulatedEnergy,
            pointPowerUsage: powerUsage,
            timestamp: new Date(crownstone_core_1.Util.crownstoneTimeToTimestamp(timestamp)),
            processed: false
        });
    }
}
exports.EnergyMonitor = EnergyMonitor;
//# sourceMappingURL=EnergyMonitor.js.map
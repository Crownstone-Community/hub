"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyMonitor = void 0;
const DbReference_1 = require("../Data/DbReference");
const MemoryDb_1 = require("../Data/MemoryDb");
const CloudCommandHandler_1 = require("../Cloud/CloudCommandHandler");
const Logger_1 = require("../../Logger");
const crownstone_core_1 = require("crownstone-core");
const EnergyProcessor_1 = require("../Processing/EnergyProcessor");
const log = Logger_1.Logger(__filename);
const SAMPLE_INTERVAL = 60000; // 1 minute;
class EnergyMonitor {
    constructor() {
        this.energyIsProcessing = false;
        this.processingPaused = false;
    }
    init() {
        this.stop();
        this.timeInterval = setInterval(() => {
            if (this.processingPaused === false) {
                this.processing().catch();
            }
        }, SAMPLE_INTERVAL * 1.1); // every 61 seconds.;
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
    resumeProcessing() {
        clearTimeout(this.pauseTimeout);
        this.processingPaused = false;
    }
    async processing() {
        await this.processMeasurements();
        // await this.uploadProcessed();
    }
    async processMeasurements() {
        if (this.energyIsProcessing) {
            return;
        }
        this.energyIsProcessing = true;
        let iterationRequired = true;
        let iterationSize = 500;
        while (iterationRequired) {
            let energyData = await DbReference_1.DbRef.energy.find({ where: { processed: false }, limit: iterationSize, order: ['timestamp ASC'] });
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyMonitor = void 0;
const DbReference_1 = require("../Data/DbReference");
const MemoryDb_1 = require("../Data/MemoryDb");
const CloudCommandHandler_1 = require("../Cloud/CloudCommandHandler");
const Logger_1 = require("../../Logger");
const log = Logger_1.Logger(__filename);
const SAMPLE_INTERVAL = 60000; // 1 minute;
class EnergyMonitor {
    constructor(hub) {
        this.hubReference = hub;
    }
    init() {
        this.stop();
        this.timeInterval = setInterval(() => {
            this.processMeasurements().catch();
        }, SAMPLE_INTERVAL * 1.1); // every 61 seconds.;
        // do the upload check initially.
        this.processMeasurements().catch();
    }
    stop() {
        if (this.timeInterval) {
            clearTimeout(this.timeInterval);
        }
    }
    async processMeasurements() {
        let energyData = await DbReference_1.DbRef.energy.find({ where: { processed: false }, order: ['timestamp ASC'] });
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
                await this._processStoneEnergy(stoneIds[i], stoneEnergy[stoneIds[i]]);
            }
        }
        catch (e) {
            log.info("processMeasurements: Error in _processStoneEnergy", e);
        }
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
        if (energyData.length === 0) {
            return;
        }
        let initial = energyData[0];
        let prev = energyData[0];
        let lastDatapoint = await DbReference_1.DbRef.energy.findOne({ where: { timestamp: { lt: prev.timestamp } } });
        // we will try to have an ever-incrementing energy usage
        // if there is no previous point to depend on, we will try
        let offsetValue;
        if (lastDatapoint !== null) {
            offsetValue = lastDatapoint.energyUsage;
        }
        else {
            offsetValue = prev.energyUsage;
        }
        let samples = [];
        for (let i = 1; i < energyData.length; i++) {
            let datapoint = energyData[i];
            let previousTimestamp = prev.timestamp.valueOf();
            let timeBetweenPoints = datapoint.timestamp.valueOf() - previousTimestamp;
            // we sample every 1 minute, on the minute.
            // we only have to process the point if:
            //   - the previous point is before the minute, and the current is equal or after the minute
            let nextSamplePoint = datapoint.timestamp.setSeconds(0, 0);
            let previousSamplePoint = prev.timestamp.setSeconds(0, 0);
            if (previousTimestamp > nextSamplePoint) {
                prev = datapoint;
                log.debug("Gap is too large. Mark as processed.");
                continue;
            }
            // Before processing, we check if the current is larger or equal than the previous.
            // If it is not, we assume that a reset has taken place.
            //       -- IF CURRENT < PREV with more than 1000J (diff is about 20W for a minute)
            //               -- reset, so dJ = cJ. Current has started again from 0, so usage is the current value.
            //       -- IF CURRENT < PREV with less than 1000J
            //               -- negative drift, flatten to 0J used.
            //       -- IF CURRENT >= PREV
            //               -- calculate dJ
            let dJ = datapoint.energyUsage - prev.energyUsage;
            if (dJ < -1000) {
                dJ = datapoint.energyUsage;
            }
            if (dJ <= 0) {
                dJ = 0;
            }
            else {
                // we just use dJ
            }
            let dJms = dJ / timeBetweenPoints;
            // We will now check how many sample points have elapsed since last sample time and current sample time.
            // we ceil this since, if we are here, we know that the sample point is in between these points.
            let elapsedSamplePoints = Math.ceil((nextSamplePoint - previousSamplePoint) / SAMPLE_INTERVAL); // ms
            // If more than 5 points have elapsed, we do not do anything and mark the prev as processed.
            if (elapsedSamplePoints > 5) {
                prev.processed = true;
                DbReference_1.DbRef.energy.update(prev).catch((e) => { log.error("Error persisting processed boolean on datapoint", 1, e); }); // we do not wait on this modifcation, but assume it will be successful. If it is not, we will re-evaluate this point later on again.
                continue;
            }
            // if less than 5 have elapsed, we do a linear interpolation, one for each point
            else {
                // @IMPROVEMENT:
                // use the pointPowerUsage on prev and on current to more accurately estimate interpolated points.
                // for now, use linear.
                for (let j = 0; j < elapsedSamplePoints; j++) {
                    let samplePoint = previousSamplePoint + (1 + j) * SAMPLE_INTERVAL;
                    let dt = samplePoint - previousTimestamp;
                    let energyAtPoint = prev.energyUsage + dt * dJms;
                    // if energyAtPoint is larger than the offsetValue, we just accept the new measurement.
                    // if it is smaller, we will add the energyAtPoint to the offsetValue.
                    // The reason here is that we will assume a reset, and that the energy from 0 to energyAtPoint is consumed.
                    // This can miss a second reboot when we're not listening.
                    // TODO: check if the difference is within the thresold of negative usage, then accept that we have negative usage.
                    if (offsetValue && energyAtPoint < offsetValue * 0.9) {
                        energyAtPoint += offsetValue;
                    }
                    samples.push({ stoneUID: Number(stoneUID), energyUsage: Math.round(energyAtPoint), timestamp: new Date(samplePoint), uploaded: false });
                }
            }
            // the last datapoint in this set will not be marked as processed, we need it in the next cycle.
            if (i === energyData.length - 1) {
                // this is the last datapoint in the set, we do not set this as processed.
            }
            else {
                datapoint.processed = true;
                DbReference_1.DbRef.energy.update(datapoint).catch((e) => { log.error("Error persisting processed boolean on datapoint", 2, e); }); // we do not wait on this modifcation, but assume it will be successful. If it is not, we will re-evaluate this point later on again.
            }
            prev = datapoint;
        }
        // we now have an array called samples, which should be loaded into the uploadable database.
        if (samples.length > 0) {
            // all processed datapoints have been marked, except the last one, and possible the very first one. If we have samples, then the very first one has been used.
            // we mark it processed because of that.
            if (initial.processed !== true) {
                initial.processed = true;
                await DbReference_1.DbRef.energy.update(initial).catch((e) => { log.error("Error persisting processed boolean on datapoint", 3, e); });
            }
            await DbReference_1.DbRef.energyProcessed.createAll(samples);
        }
    }
    collect(crownstoneId, accumulatedEnergy, powerUsage) {
        DbReference_1.DbRef.energy.create({
            stoneUID: crownstoneId,
            energyUsage: accumulatedEnergy,
            pointPowerUsage: powerUsage,
            timestamp: new Date(),
            processed: false
        });
    }
}
exports.EnergyMonitor = EnergyMonitor;
//# sourceMappingURL=EnergyMonitor.js.map
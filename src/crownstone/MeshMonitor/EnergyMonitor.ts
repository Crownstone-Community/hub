import {Dbs} from '../Data/DbReference';
import Timeout = NodeJS.Timeout;
import {EnergyData, EnergyDataProcessed} from '../../models';
import {DataObject} from '@loopback/repository/src/common-types';
import {MemoryDb} from '../Data/MemoryDb';
import {CloudCommandHandler} from '../Cloud/CloudCommandHandler';
import {Logger} from '../../Logger';
import { Util } from 'crownstone-core';
import {minuteInterval, processPair} from '../Processing/EnergyProcessor';
import {IntervalData} from '../Processing/IntervalData';
import {InMemoryCache} from '../Data/InMemoryCache';
const log = Logger(__filename);

const PROCESSING_INTERVAL = 60000; // 1 minute;

export class EnergyMonitor {

  timeInterval : Timeout | null;
  storeInterval : Timeout | null;
  energyIsProcessing: boolean = false;
  energyIsAggregating: boolean = false;
  processingPaused: boolean = false;
  pauseTimeout: Timeout;
  aggregationProcessingPaused: boolean = false;
  aggregationPauseTimeout: Timeout;

  energyCache : InMemoryCache;

  constructor() {
    this.energyCache = new InMemoryCache(async (data: any[]) => { await Dbs.energy.createAll(data) }, 'energyMonitor');
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
    }, PROCESSING_INTERVAL*1.1); // every 61 seconds.;

    // do the upload check initially.
    this.processing().catch()
  }

  stop() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
    if (this.storeInterval) {
      clearInterval(this.storeInterval)
    }
  }

  pauseProcessing(seconds : number) {
    clearTimeout(this.pauseTimeout);
    this.processingPaused = true;
    this.pauseTimeout = setTimeout(() => { this.processingPaused = false}, seconds*1000);
  }
  pauseAggregationProcessing(seconds : number) {
    clearTimeout(this.aggregationPauseTimeout);
    this.aggregationProcessingPaused = true;
    this.aggregationPauseTimeout = setTimeout(() => { this.aggregationProcessingPaused = false}, seconds*1000);
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

    await this.energyCache.store();

    this.energyIsProcessing = true;
    let iterationRequired = true;
    let iterationSize = 500;

    let count = 0;
    while (iterationRequired) {
      let energyData = await Dbs.energy.find({where: {processed: false}, limit:iterationSize, order:['timestamp ASC']} );

      count += energyData.length;
      if (energyData.length === iterationSize) {
        iterationRequired = true;
      }
      else {
        iterationRequired = false;
      }

      // -------------------------------------------------------
      // sort in separate lists per stone.
      let stoneEnergy : {[stoneUID : string]: EnergyData[] } = {};
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
          await this._processStoneEnergy(Number(stoneIds[i]), stoneEnergy[stoneIds[i]])
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
    log.debug("Start processing Aggregations...")
    if (this.energyIsProcessing || this.energyIsAggregating) {
      return;
    }

    this.energyIsAggregating = true;

    let uids = await Dbs.energyProcessed.getStoneUIDs();
    for (let i = 0; i < uids.length; i++) {
      // get last known 5 minute interval datapoint
      let stoneUID = uids[i];
      let aggregationIntervals = Object.keys(IntervalData);
      for (let j = 0; j < aggregationIntervals.length; j++) {
        // @ts-ignore
        let intervalData = IntervalData[aggregationIntervals[j]];
        await this._processAggregations(stoneUID, intervalData)
      }
    }

    this.energyIsAggregating = false;
  }



  async _processAggregations(
    stoneUID: number,
    intervalData: IntervalData,
    ) {
    let lastPoint = await Dbs.energyProcessed.findOne({where: {stoneUID: stoneUID, interval: intervalData.targetInterval}, order: ['timestamp DESC']});
    log.debug("Last point to start processing ",intervalData.targetInterval,"from:", lastPoint)
    let fromDate = lastPoint && lastPoint.timestamp || new Date(0);

    let iterationRequired = true;
    let iterationSize = 500;

    let samples : DataObject<EnergyDataProcessed>[] = [];
    while (iterationRequired) {
      samples = [];
      let processedPoints = await Dbs.energyProcessed.find({where: { stoneUID: stoneUID, interval: intervalData.basedOnInterval, timestamp: {gt: fromDate}}, limit: iterationSize, order: ['timestamp ASC'] });

      log.debug("Aggregating stone", stoneUID, "at", intervalData.targetInterval, "based on", intervalData.basedOnInterval, "from", fromDate, ":", processedPoints.length);
      if (processedPoints.length === iterationSize) {
        iterationRequired = true;
      }
      else {
        iterationRequired = false;
      }

      let previousPoint : EnergyDataProcessed | null = null;
      for (let i = 0; i < processedPoints.length; i++) {
        let point = processedPoints[i];
        let timestamp  = new Date(point.timestamp).valueOf();
        let isONsamplePoint = intervalData.isOnSamplePoint(timestamp);

        if (isONsamplePoint) {
          samples.push({stoneUID: stoneUID, energyUsage: point.energyUsage, timestamp: point.timestamp, uploaded: false, interval: intervalData.targetInterval});
        }
        else if (previousPoint) {
          let previousTimestamp = new Date(previousPoint.timestamp).valueOf()

          let previousSamplePointFromCurrent = intervalData.getPreviousSamplePoint(timestamp);
          let previousSamplePointFromLast    = intervalData.getPreviousSamplePoint(previousTimestamp);

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
              for (let j = 0; j < elapsedSamplePoints; j++ ) {
                let samplePoint = previousSamplePointFromLast + (1+j)*intervalData.sampleIntervalMs;
                let dt = samplePoint - previousTimestamp;
                let energyAtPoint = previousPoint.energyUsage + dt*dJms;
                samples.push({stoneUID: stoneUID, energyUsage: Math.round(energyAtPoint), timestamp: new Date(samplePoint), uploaded: false, interval: intervalData.targetInterval});
              }
            }
          }
        }

        previousPoint = point;
      }
      if (previousPoint) {
        fromDate = previousPoint.timestamp;
      }

      await Dbs.energyProcessed.createAll(samples);
    }
  }




  async uploadProcessed() {
    let processedData = await Dbs.energyProcessed.find({where: {uploaded: false}} )
    try {
      await this._uploadStoneEnergy(processedData)
    }
    catch (e) {
      log.info("processMeasurements: Error in _uploadStoneEnergy", e);
    }
  }

  async _uploadStoneEnergy(processedData: EnergyDataProcessed[]) {
    if (processedData.length > 0) {
      let hasData = false;
      let measurementData : EnergyMeasurementData = {};
      let dataUploaded : EnergyDataProcessed[] = [];
      for (let i = 0; i < processedData.length; i++) {
        let energy = processedData[i];
        // console.log(energy.stoneUID, MemoryDb.stones[energy.stoneUID]?.cloudId)
        let cloudId = MemoryDb.stones[energy.stoneUID]?.cloudId;
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
        CloudCommandHandler.addToQueue(async (CM) => {
          await CM.cloud.hub().uploadEnergyMeasurements(measurementData);
          for (let i = 0; i < dataUploaded.length; i++) {
            await Dbs.energyProcessed.update(dataUploaded[i])
          }
        })
      }
    }
  }


  async _processStoneEnergy(stoneUID: number, energyData: EnergyData[]) {
    // we want at least 2 points to process.
    if (energyData.length === 0) { return }
    let samples : DataObject<EnergyDataProcessed>[] = [];

    // get the lastProcessed datapoint.
    let startFromIndex = 0;
    let lastDatapoint = await Dbs.energy.findOne({where: {stoneUID: stoneUID, timestamp: {lt: energyData[0].timestamp}, processed: true}, order: ['timestamp DESC']});
    if (!lastDatapoint) {
      if (energyData.length < 2) {
        return;
      }
      startFromIndex = 1;
      lastDatapoint = energyData[0];
    }

    for (let i = startFromIndex; i < energyData.length; i++) {
      let datapoint = energyData[i];
      await processPair(lastDatapoint, datapoint, {calculateSamplePoint: minuteInterval, intervalMs: 60000}, samples);
      lastDatapoint = datapoint;
    }


    if (samples.length > 0) {
      // all processed datapoints have been marked, except the last one, and possible the very first one. If we have samples, then the very first one has been used.
      // we mark it processed because of that.
      await Dbs.energyProcessed.createAll(samples);
    }
  }



  collect(crownstoneId: number, accumulatedEnergy: number, powerUsage: number, timestamp: number) {
    this.energyCache.collect({
      stoneUID:    crownstoneId,
      energyUsage: accumulatedEnergy,
      pointPowerUsage: powerUsage,
      timestamp:   new Date(Util.crownstoneTimeToTimestamp(timestamp)),
      processed:   false
    });
    // return Dbs.energy.create()
  }

}


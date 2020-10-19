import {DbRef} from '../Data/DbReference';
import Timeout = NodeJS.Timeout;
import {EnergyData, EnergyDataProcessed} from '../../models';
import {DataObject} from '@loopback/repository/src/common-types';
import {MemoryDb} from '../Data/MemoryDb';
import {CloudCommandHandler} from '../Cloud/CloudCommandHandler';
import {Logger} from '../../Logger';
import { Util } from 'crownstone-core';
import {minuteInterval, processPair} from '../Processing/EnergyProcessor';
const log = Logger(__filename);


const SAMPLE_INTERVAL = 60000; // 1 minute;

export class EnergyMonitor {

  timeInterval : Timeout | null;
  energyIsProcessing: boolean = false;

  init() {
    this.stop();
    this.timeInterval = setInterval(() => {
      this.processing().catch()
    }, SAMPLE_INTERVAL*1.1); // every 61 seconds.;

    // do the upload check initially.
    this.processing().catch()
  }

  stop() {
    if (this.timeInterval) {
      clearTimeout(this.timeInterval)
    }
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
    let energyData = await DbRef.energy.find({where: {processed: false}, order:['timestamp ASC']} )
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
    }
    this.energyIsProcessing = false;
  }


  async uploadProcessed() {
    let processedData = await DbRef.energyProcessed.find({where: {uploaded: false}} )
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
            await DbRef.energyProcessed.update(dataUploaded[i])
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
    let lastDatapoint = await DbRef.energy.findOne({where: {stoneUID: stoneUID, timestamp: {lt: energyData[0].timestamp}, processed: true}, order: ['timestamp DESC']});
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
      await DbRef.energyProcessed.createAll(samples);
    }
  }







  collect(crownstoneId: number, accumulatedEnergy: number, powerUsage: number, timestamp: number) {
    return DbRef.energy.create({
      stoneUID:    crownstoneId,
      energyUsage: accumulatedEnergy,
      pointPowerUsage: powerUsage,
      timestamp:   new Date(Util.crownstoneTimeToTimestamp(timestamp)),
      processed:   false
    })
  }

}
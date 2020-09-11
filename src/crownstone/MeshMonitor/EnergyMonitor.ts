import {DbRef} from '../Data/DbReference';
import Timeout = NodeJS.Timeout;


export class EnergyMonitor {

  timeInterval : Timeout | null;
  hubReference: CrownstoneHub;

  constructor(hub : CrownstoneHub) {
    this.hubReference = hub;
  }

  init() {
    this.stop();
    this.timeInterval = setInterval(() => {
      this.checkForUpload().catch()
    }, 61*1000); // every 61 seconds.;

    // set the time initially
    this.checkForUpload().catch()
  }

  stop() {
    if (this.timeInterval) {
      clearTimeout(this.timeInterval)
    }
  }

  async checkForUpload() {
    let energyData = await DbRef.energy.find({where: {uploaded: false}})


  }

  collect(crownstoneId: number, accumulatedEnergy: number) {
    DbRef.energy.create({
      stoneUID:    crownstoneId,
      energyUsage: accumulatedEnergy,
      timestamp:   new Date(),
      uploaded:    false
    })
  }

}
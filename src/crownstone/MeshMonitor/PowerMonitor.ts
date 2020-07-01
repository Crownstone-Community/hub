import {DbRef} from '../Data/DbReference';


export class PowerMonitor {

  collect(crownstoneId: number, powerUsageReal: number, powerFactor: number) {
    DbRef.power.create({
      stoneUID: crownstoneId, powerUsage: powerUsageReal, powerFactor: powerFactor, timestamp: new Date()
    })
  }

}
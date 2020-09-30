import {DbRef} from '../Data/DbReference';
import {Util} from 'crownstone-core';


export class PowerMonitor {

  collect(crownstoneId: number, powerUsageReal: number, powerFactor: number, timestamp: number) {
    DbRef.power.create({
      stoneUID:    crownstoneId,
      powerUsage:  powerUsageReal,
      powerFactor: powerFactor,
      timestamp:   new Date(Util.crownstoneTimeToTimestamp(timestamp)),
      significant: false,
      uploaded:    false
    })
  }

}
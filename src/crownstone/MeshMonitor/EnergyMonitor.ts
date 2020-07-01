import {DbRef} from '../Data/DbReference';


export class EnergyMonitor {

  collect(crownstoneId: number, accumulatedEnergy: number) {
    DbRef.energy.create({ stoneUID: crownstoneId, energyUsage: accumulatedEnergy, timestamp: new Date() })
  }

}
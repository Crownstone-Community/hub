import {Dbs} from '../data/DbReference';
import {Util} from 'crownstone-core';
import {InMemoryCache} from '../data/InMemoryCache';
import Timeout = NodeJS.Timeout;


export class PowerMonitor {


  storeInterval : Timeout;
  // powerCache : InMemoryCache;

  constructor() {
    // this.powerCache = new InMemoryCache(async (data: object[]) => { await Dbs.power.createAll(data) }, 'powerMonitor')
  }


  init() {
    this.stop();
    // use this to batch the writes in the database.
    // this.storeInterval = setInterval(async () => {
    //   await this.powerCache.store();
    // }, 2000);
  }

  stop() {
    if (this.storeInterval) {
      // clearInterval(this.storeInterval);
    }
  }

  collect(crownstoneId: number, powerUsageReal: number, powerFactor: number, timestamp: number) {
   return Dbs.power.create({
      stoneUID:    crownstoneId,
      powerUsage:  powerUsageReal,
      powerFactor: powerFactor,
      timestamp:   new Date(Util.crownstoneTimeToTimestamp(timestamp)),
      significant: false,
      uploaded:    false
    })
  }

}
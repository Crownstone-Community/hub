import {Dbs} from '../data/DbReference';
import {AssetFilter} from '../../models/cloud/asset-filter.model';
import {getMasterCRC} from 'crownstone-core';
import {Uart} from '../uart/Uart';

export class FilterManager {
  initialized = false;
  uartReference: Uart;

  constructor(uartReference: Uart) {
    this.uartReference = uartReference;
  }

  init() {
    if (this.initialized === false) {
      this.initialized = true;
    }
  }

  cleanup() {

  }

  async refreshFilterSets(baseMasterVersion: number = 1) {
    let allFilters = await Dbs.assetFilters.find();
    let allSets    = await Dbs.assetFilterSets.find();

    if (allSets.length === 0) {
      // create filterSet
      let newSet = await Dbs.assetFilterSets.create({
        masterVersion: baseMasterVersion,
        masterCRC: generateMasterCRC(allFilters)
      });
      await updateFilterSetIds(allFilters, newSet.id);
      await this.uartReference.syncFilters();
    }
    else if (allSets.length === 1) {
      // bump filtersets if required.
      // we do an add-delete of the filters. They're not updated.
      let changeRequired = false;
      for (let filter of allFilters) {
        if (!filter.filterSetId) {
          changeRequired = true;
          break;
        }
      }

      let set = allSets[0];

      if (changeRequired) {
        set.masterVersion = set.masterVersion + 1;
        set.masterCRC     = generateMasterCRC(allFilters);

        await updateFilterSetIds(allFilters, set.id)
        await Dbs.assetFilterSets.update(set);
        await this.uartReference.syncFilters();
      }
    }
    else {
      let highestNumber = 0;
      for (let set of allSets) {
        highestNumber = Math.max(set.masterVersion, highestNumber);
      }
      // something went wrong, override the masterVersion
      await Dbs.assetFilterSets.deleteAll({});
      await this.refreshFilterSets(highestNumber+1);
    }
  }
}

async function updateFilterSetIds(filters: AssetFilter[], setId: string) {
  for (let filter of filters) {
    if (filter.filterSetId !== setId) {
      filter.filterSetId = setId;
      await Dbs.assetFilters.update(filter)
    }
  }
}


function generateMasterCRC(filters: AssetFilter[]) : number {
  let payload : Record<filterId, filterCRC> = {};
  // map to required format.
  for (let filter of filters) {
    payload[filter.idOnCrownstone] = parseInt(filter.dataCRC);
  }
  return getMasterCRC(payload)
}

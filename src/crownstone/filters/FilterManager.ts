import {Uart} from '../uart/Uart';
import {Dbs} from '../data/DbReference';
import {FilterType, increaseMasterVersion} from 'crownstone-core';
import {AssetFilter} from '../../models/cloud/asset-filter.model';
import {FilterUtil} from './FilterUtil';
import {AssetFilter as AssetFilterCore} from 'crownstone-core/dist/filters/AssetFilter';
import {Asset, filterFormat, filterOutputDescription} from '../../models/cloud/asset.model';


interface FilterRequirement {
  inputData:         filterFormat
  outputDescription: filterOutputDescription,
  profileId:         number,
  assets:            Asset[],
  data:              string[],
  dataMap:         {[data: string] : boolean}
  filterPacket?:     string,
  filterCRC?:        string,
  filterType:        number,
  exists:            boolean
}

interface FilterRequirements {
  [typeDescription: string]: FilterRequirement
}


export class FilterManagerClass {
  initialized = false;
  uartReference: Uart | null = null;

  constructor() {}

  injectUartReference(uartReference: Uart) {
    this.uartReference = uartReference;
  }

  async refreshFilterSets(baseMasterVersion: number = 1, allowSyncing : boolean = true) {
    if (this.uartReference === null) { throw "UART_NOT_READY"; }

    let allFilters = await Dbs.assetFilters.find();
    let allSets    = await Dbs.assetFilterSets.find();

    if (allSets.length === 0) {
      // create filterSet
      let newSet = await Dbs.assetFilterSets.create({
        masterVersion: baseMasterVersion,
        masterCRC: FilterUtil.generateMasterCRC(allFilters)
      });
      await updateFilterSetIds(allFilters, newSet.id);
      if (allowSyncing) {
        await this.uartReference.syncFilters();
      }
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
        set.masterVersion = increaseMasterVersion(set.masterVersion);
        set.masterCRC     = FilterUtil.generateMasterCRC(allFilters);

        await updateFilterSetIds(allFilters, set.id)
        await Dbs.assetFilterSets.update(set);
        if (allowSyncing) {
          await this.uartReference.syncFilters();
        }
      }
    }
    else { //(allSets.length > 1)
      let highestNumber = 0;
      for (let set of allSets) {
        highestNumber = Math.max(set.masterVersion, highestNumber);
      }
      // something went wrong, override the masterVersion
      await Dbs.assetFilterSets.deleteAll({});
      await this.refreshFilterSets(highestNumber + 1);

      if (allowSyncing) {
        await this.uartReference.syncFilters();
      }
    }
  }

  async reconstructFilters() : Promise<boolean> {
    let allAssets  = await Dbs.assets.find();
    let allFilters = await Dbs.assetFilters.find();

    let filterChangeRequired = false;
    let filterRequirements : FilterRequirements = {};

    // summarize the filters we need to construct
    for (let asset of allAssets) {
      let typeDescription = FilterUtil.getMetaDataDescriptionFromAsset(asset);
      if (filterRequirements[typeDescription] === undefined) {
        filterRequirements[typeDescription] = {
          inputData:         asset.inputData,
          outputDescription: asset.outputDescription,
          profileId:         asset.profileId,
          data:              [],
          dataMap:           {},
          assets:            [],
          filterType:        FilterType.CUCKCOO_V1,
          exists:            false,
        };
      }

      filterRequirements[typeDescription].assets.push(asset);

      if (filterRequirements[typeDescription].dataMap[asset.data] === undefined) {
        filterRequirements[typeDescription].dataMap[asset.data] = true;
        filterRequirements[typeDescription].data.push(asset.data);
      }
    }

    // contruct filters from requirements
    for (let description in filterRequirements) {
      let requirement = filterRequirements[description];
      let metaData = FilterUtil.getFilterMetaData(
        requirement.filterType,
        requirement.profileId,
        requirement.inputData,
        requirement.outputDescription
      );

      let filter = new AssetFilterCore(metaData)
      for (let data of requirement.data) {
        filter.addToFilter(Buffer.from(data, 'hex'));;
      }

      let filterPacket         = filter.getFilterPacket();
      requirement.filterPacket = filterPacket.toString('hex');
      requirement.filterCRC    = filter.getCRC().toString(16)
    }

    // match against the existing filters.
    let maxId = -1;
    for (let filter of allFilters) {
      maxId = Math.max(filter.idOnCrownstone, maxId);
      let typeDescription = FilterUtil.getMetaDataDescriptionFromFilter(filter);
      let requiredMatchingVersion = filterRequirements[typeDescription];
      if (requiredMatchingVersion && requiredMatchingVersion.filterPacket === filter.data) {
        requiredMatchingVersion.exists = true;
        await updateAssetFilterIds(requiredMatchingVersion.assets, filter.id).catch()
      }
      else {
        // Delete this filter.
        filterChangeRequired = true;
        await Dbs.assetFilters.delete(filter).catch((err) => { console.log("Error while removing filter", err); })
      }
    }


    for (let description in filterRequirements) {
      let requirement = filterRequirements[description];
      if (requirement.exists === false) {
        // create filter.
        filterChangeRequired = true;
        let newFilter = await Dbs.assetFilters.create({
          type: requirement.filterType,
          profileId: requirement.profileId,
          idOnCrownstone: maxId+1,
          inputData: requirement.inputData,
          outputDescription: requirement.outputDescription,
          data: requirement.filterPacket,
          dataCRC: requirement.filterCRC,
        });

        await updateAssetFilterIds(requirement.assets, newFilter.id).catch()
      }
    }


    return filterChangeRequired;
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

async function updateAssetFilterIds(assets: Asset[], filterId: string) {
  for (let asset of assets) {
    if (asset.filterId !== filterId) {
      asset.filterId = filterId;
      await Dbs.assets.update(asset)
    }
  }
}



export const FilterManager = new FilterManagerClass();
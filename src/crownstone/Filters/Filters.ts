import { Asset, filterFormat, filterOutputDescription} from '../../models/cloud/asset.model';
import { AssetFilter} from '../../models/cloud/asset-filter.model';
import {CuckooFilter, FilterType, getFilterCRC} from 'crownstone-core';
import {Dbs} from '../Data/DbReference';
import {FilterUtil} from './FilterUtil';


interface FilterRequirement {
  inputData:         filterFormat
  outputDescription: filterOutputDescription,
  profileId: number,
  assets: Asset[],
  data: string[],
  dataMap: {[data: string] : boolean}
  filterPacket?: string,
  filterCRC?: string,
  filterType: number,
  exists: boolean
}

interface FilterRequirements {
  [typeDescription: string]: FilterRequirement
}

/**
 * This does and add or delete of the filters.
 * Filters are not updated.
 * @param allAssets
 * @param allFilters
 */
export async function reconstructFilters(allAssets: Asset[], allFilters: AssetFilter[]) : Promise<boolean> {
  let filterChangeRequired = false;
  let filterRequirements : FilterRequirements = {};

  // summarize the filters we need to construct
  for (let asset of allAssets) {
    let typeDescription = getMetaDataDescriptionFromAsset(asset);
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
    let filter = new CuckooFilter(requirement.data.length);
    for (let data of requirement.data) {
      filter.add(Buffer.from(data, 'hex'));;
    }

    let filterPacket = filter.getPacket();
    let metaData = FilterUtil.getFilterMetaData(
      requirement.filterType,
      requirement.profileId,
      requirement.inputData,
      requirement.outputDescription
    );
    let metadataPacket       = metaData.getPacket()
    requirement.filterPacket = Buffer.concat([metadataPacket, filterPacket]).toString('hex');
    requirement.filterCRC    = getFilterCRC(metaData, filter.getPacket()).toString(16);
  }

  // match against the existing filters.
  for (let filter of allFilters) {
    let typeDescription = getMetaDataDescriptionFromFilter(filter);
    let requiredMatchingVersion = filterRequirements[typeDescription];
    if (requiredMatchingVersion && requiredMatchingVersion.filterPacket === filter.data) {
      requiredMatchingVersion.exists = true;
      await updateAssetFilterIds(requiredMatchingVersion.assets, filter.id).catch((err) => { console.log("@",err)})
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
        inputData: requirement.inputData,
        outputDescription: requirement.outputDescription,
        data: requirement.filterPacket,
        dataCRC: requirement.filterCRC,
      });

      await updateAssetFilterIds(requirement.assets, newFilter.id).catch((err) => { console.log("@2",err)})
    }
  }


  return filterChangeRequired;
}

async function updateAssetFilterIds(assets: Asset[], filterId: string) {
  for (let asset of assets) {
    if (asset.filterId !== filterId) {
      asset.filterId = filterId;
      await Dbs.assets.update(asset)
    }
  }
}


export function getMetaDataDescriptionFromAsset(asset: Asset) {
  return getMetaDataDescription(asset.profileId, asset.inputData, asset.outputDescription);
}
export function getMetaDataDescriptionFromFilter(filter: AssetFilter) {
  return getMetaDataDescription(filter.profileId, filter.inputData, filter.outputDescription);
}
export function getMetaDataDescription(
    profileId: number,
    input : filterFormat,
    output: filterOutputDescription,
  ) : string {

  let inputSet = input.type;
  let outputSet = output.type;
  switch (input.type) {
    case 'MAC_ADDRESS':
      break;
    case 'AD_DATA':
      inputSet += input.adType;
      break;
    case 'MASKED_AD_DATA':
      inputSet += input.adType;
      inputSet += input.mask;
      break;
  }


  if (input.type === "AD_DATA") {
    inputSet += input.adType;
  }
  if (output.type === 'SHORT_ASSET_ID_TRACK') {
    outputSet += output.inputData.type;
    switch (output.inputData.type) {
      case 'MAC_ADDRESS':
        break;
      case 'AD_DATA':
        outputSet += output.inputData.adType;
        break;
      case 'MASKED_AD_DATA':
        outputSet += output.inputData.adType;
        outputSet += output.inputData.mask;
        break;
    }
  }

  return `${inputSet}_${outputSet}_p${profileId}`;
}
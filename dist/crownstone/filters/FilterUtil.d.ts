import { FilterMetaData } from 'crownstone-core';
import { AssetFilter } from '../../models/cloud/asset-filter.model';
import { Asset, filterFormat, filterOutputDescription } from '../../models/cloud/asset.model';
export declare const FilterUtil: {
    getMetaData: (filter: AssetFilter) => FilterMetaData;
    getFilterMetaData: (type: number, profileId: number, inputData: filterHubFormat, outputDescription: filterHubOutputDescription) => FilterMetaData;
    generateMasterCRC: (filters: AssetFilter[]) => number;
    getMetaDataDescriptionFromAsset: (asset: Asset) => string;
    getMetaDataDescriptionFromFilter: (filter: AssetFilter) => string;
    getMetaDataDescription: (profileId: number, input: filterFormat, output: filterOutputDescription) => string;
};

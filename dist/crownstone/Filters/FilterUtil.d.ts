import { FilterMetaData } from 'crownstone-core';
import { AssetFilter } from '../../models/cloud/asset-filter.model';
export declare const FilterUtil: {
    getMetaData: (filter: AssetFilter) => FilterMetaData;
    getFilterMetaData: (type: number, profileId: number, inputData: filterHubFormat, outputDescription: filterHubOutputDescription) => FilterMetaData;
};

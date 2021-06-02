import { AssetFilter as AssetFilterCore } from 'crownstone-core';
import { AssetFilter } from '../../models/cloud/asset-filter.model';
import { Asset, filterFormat, filterOutputDescription } from '../../models/cloud/asset.model';
export declare const FilterUtil: {
    setFilterMetaData: (filter: AssetFilterCore, type: string, profileId: number, inputData: filterHubFormat, outputDescription: filterHubOutputDescription, exclude: boolean) => import("crownstone-core").FilterMetaData;
    getFilterSizeOverhead(asset: Asset): number;
    generateMasterCRC: (filters: AssetFilter[]) => number;
    getMetaDataDescriptionFromAsset: (asset: Asset, filterType: string) => string;
    getMetaDataDescriptionFromFilter: (filter: AssetFilter) => Promise<string>;
    /**
     * In the case of filter types which depend on an exact amount of bytes, the type is appended with ":<bytelength>", ie: ":2"
     * @param profileId
     * @param input
     * @param output
     * @param type
     */
    getMetaDataDescription: (profileId: number, input: filterFormat, output: filterOutputDescription, exclude: boolean, type: string) => string;
};

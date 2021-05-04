import { Asset, filterFormat, filterOutputDescription } from '../../models/cloud/asset.model';
import { AssetFilter } from '../../models/cloud/asset-filter.model';
/**
 * This does and add or delete of the filters.
 * Filters are not updated.
 * @param allAssets
 * @param allFilters
 */
export declare function reconstructFilters(allAssets: Asset[], allFilters: AssetFilter[]): Promise<boolean>;
export declare function getMetaDataDescriptionFromAsset(asset: Asset): string;
export declare function getMetaDataDescriptionFromFilter(filter: AssetFilter): string;
export declare function getMetaDataDescription(profileId: number, input: filterFormat, output: filterOutputDescription): string;

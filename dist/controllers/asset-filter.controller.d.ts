import { AssetFilterRepository } from '../repositories/cloud/asset-filter.repository';
import { UserProfileDescription } from '../security/authentication-strategies/csToken-strategy';
import { AssetFilter } from '../models/cloud/asset-filter.model';
import { AssetFilterSetRepository } from '../repositories/cloud/asset-filter-set.repository';
/**
 * This controller will echo the state of the hub.
 */
export declare class AssetFilterController {
    protected filterRepo: AssetFilterRepository;
    protected filterSetRepo: AssetFilterSetRepository;
    constructor(filterRepo: AssetFilterRepository, filterSetRepo: AssetFilterSetRepository);
    getAllFilters(userProfile: UserProfileDescription): Promise<AssetFilter[]>;
    getFilter(userProfile: UserProfileDescription, id: string): Promise<AssetFilter>;
}

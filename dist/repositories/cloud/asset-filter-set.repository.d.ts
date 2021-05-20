import { HasManyRepositoryFactory, juggler } from '@loopback/repository';
import { TimestampedCrudRepository } from '../bases/timestamped-crud-repository';
import { AssetFilterRepository } from './asset-filter.repository';
import { AssetFilter } from '../../models/cloud/asset-filter.model';
import { AssetFilterSet } from '../../models/cloud/asset-filter-set.model';
export declare class AssetFilterSetRepository extends TimestampedCrudRepository<AssetFilterSet, typeof AssetFilterSet.prototype.id> {
    protected datasource: juggler.DataSource;
    protected filterRepo: AssetFilterRepository;
    filters: HasManyRepositoryFactory<AssetFilter, typeof AssetFilter.prototype.id>;
    constructor(datasource: juggler.DataSource, filterRepo: AssetFilterRepository);
}

import { BelongsToAccessor, Getter, HasManyRepositoryFactory, juggler } from '@loopback/repository';
import { TimestampedCrudRepository } from '../bases/timestamped-crud-repository';
import { AssetFilter } from '../../models/cloud/asset-filter.model';
import { AssetRepository } from './asset.repository';
import { Asset } from '../../models/cloud/asset.model';
import { AssetFilterSet } from '../../models/cloud/asset-filter-set.model';
import { AssetFilterSetRepository } from './asset-filter-set.repository';
export declare class AssetFilterRepository extends TimestampedCrudRepository<AssetFilter, typeof AssetFilter.prototype.id> {
    protected datasource: juggler.DataSource;
    protected assetRepository: AssetRepository;
    readonly filterSet: BelongsToAccessor<AssetFilterSet, typeof AssetFilterSet.prototype.id>;
    assets: HasManyRepositoryFactory<Asset, typeof Asset.prototype.id>;
    constructor(datasource: juggler.DataSource, filterSetRepoGetter: Getter<AssetFilterSetRepository>, assetRepository: AssetRepository);
}

import { BelongsToAccessor, Count, DataObject, Getter, juggler, Options, Where } from '@loopback/repository';
import { TimestampedCrudRepository } from '../bases/timestamped-crud-repository';
import { Asset } from '../../models/cloud/asset.model';
import { AssetFilter } from '../../models/cloud/asset-filter.model';
import { AssetFilterRepository } from './asset-filter.repository';
export declare class AssetRepository extends TimestampedCrudRepository<Asset, typeof Asset.prototype.id> {
    protected datasource: juggler.DataSource;
    readonly filter: BelongsToAccessor<AssetFilter, typeof AssetFilter.prototype.id>;
    constructor(datasource: juggler.DataSource, filterRepoGetter: Getter<AssetFilterRepository>);
    updateAll(data: DataObject<Asset>, where?: Where<Asset>, options?: Options): Promise<Count>;
}

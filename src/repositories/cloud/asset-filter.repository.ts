import {BelongsToAccessor, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import {TimestampedCrudRepository} from '../bases/timestamped-crud-repository';
import { inject }                  from '@loopback/core';
import {AssetFilter}                    from '../../models/cloud/asset-filter.model';
import {AssetRepository}           from './asset.repository';
import {Asset}                     from '../../models/cloud/asset.model';
import {AssetFilterSet}                 from '../../models/cloud/asset-filter-set.model';
import {AssetFilterSetRepository}  from './asset-filter-set.repository';


export class AssetFilterRepository extends TimestampedCrudRepository<AssetFilter,typeof AssetFilter.prototype.id> {
  public readonly filterSet: BelongsToAccessor<AssetFilterSet, typeof AssetFilterSet.prototype.id>;
  public          assets: HasManyRepositoryFactory<Asset, typeof Asset.prototype.id>;

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
    @repository.getter('FilterSetRepository') filterSetRepoGetter: Getter<AssetFilterSetRepository>,
    @repository(AssetRepository) protected assetRepository: AssetRepository,
  ) {
    super(AssetFilter, datasource);

    this.filterSet = this.createBelongsToAccessorFor('filterSet',   filterSetRepoGetter);
    this.assets    = this.createHasManyRepositoryFactoryFor('assets',async () => assetRepository);

    // add this line to register inclusion resolver
    this.registerInclusionResolver('assets', this.assets.inclusionResolver);
  }

}


import {BelongsToAccessor, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import {TimestampedCrudRepository} from '../bases/timestamped-crud-repository';
import { inject }                  from '@loopback/core';
import {Filter}                    from '../../models/cloud/filter.model';
import {AssetRepository}           from './asset.repository';
import {Asset}                     from '../../models/cloud/asset.model';
import {FilterSet}                 from '../../models/cloud/filter-set.model';
import {FilterSetRepository}       from './filter-set.repository';


export class FilterRepository extends TimestampedCrudRepository<Filter,typeof Filter.prototype.id> {
  public readonly filterSet: BelongsToAccessor<FilterSet, typeof FilterSet.prototype.id>;
  public          assets: HasManyRepositoryFactory<Asset, typeof Asset.prototype.id>;

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
    @repository.getter('FilterSetRepository') filterSetRepoGetter: Getter<FilterSetRepository>,
    @repository(AssetRepository) protected assetRepository: AssetRepository,
  ) {
    super(Filter, datasource);

    this.filterSet = this.createBelongsToAccessorFor('filterSet',   filterSetRepoGetter);
    this.assets    = this.createHasManyRepositoryFactoryFor('assets',async () => assetRepository);
    // this.presence = this.createHasOneRepositoryFactoryFor('presence', assetPresenceRepoGetter);

    // add this line to register inclusion resolver
    this.registerInclusionResolver('assets', this.assets.inclusionResolver);
  }

}


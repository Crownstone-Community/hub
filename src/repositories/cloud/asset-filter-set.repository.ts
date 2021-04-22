import {HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from '../bases/timestamped-crud-repository';
import {AssetFilterRepository} from './asset-filter.repository';
import {AssetFilter} from '../../models/cloud/asset-filter.model';
import {AssetFilterSet} from '../../models/cloud/asset-filter-set.model';


export class AssetFilterSetRepository extends TimestampedCrudRepository<AssetFilterSet,typeof AssetFilterSet.prototype.id> {
  public filters: HasManyRepositoryFactory<AssetFilter, typeof AssetFilter.prototype.id>;

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
    @repository(AssetFilterRepository) protected filterRepo: AssetFilterRepository,
  ) {
    super(AssetFilterSet, datasource);

    this.filters = this.createHasManyRepositoryFactoryFor('filters',async () => filterRepo);

    // add this line to register inclusion resolver
    this.registerInclusionResolver('filters', this.filters.inclusionResolver);
  }

}


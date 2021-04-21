import {HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from '../bases/timestamped-crud-repository';
import {FilterRepository} from './filter.repository';
import {Filter} from '../../models/cloud/filter.model';
import {FilterSet} from '../../models/cloud/filter-set.model';


export class FilterSetRepository extends TimestampedCrudRepository<FilterSet,typeof FilterSet.prototype.id> {
  public filters: HasManyRepositoryFactory<Filter, typeof Filter.prototype.id>;

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
    @repository(FilterRepository) protected filterRepo: FilterRepository,
  ) {
    super(FilterSet, datasource);

    this.filters = this.createHasManyRepositoryFactoryFor('filters',async () => filterRepo);

    // add this line to register inclusion resolver
    this.registerInclusionResolver('filters', this.filters.inclusionResolver);
  }

}


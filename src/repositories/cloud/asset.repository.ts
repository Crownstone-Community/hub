import {BelongsToAccessor, Count, DataObject, Getter, juggler, Options, repository, Where} from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from '../bases/timestamped-crud-repository';
import {Asset} from '../../models/cloud/asset.model';
import {Filter} from '../../models/cloud/filter.model';
import {FilterRepository} from './filter.repository';


export class AssetRepository extends TimestampedCrudRepository<Asset,typeof Asset.prototype.id> {
  public readonly filter: BelongsToAccessor<Filter, typeof Filter.prototype.id>;

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
    @repository.getter('FilterRepository') filterRepoGetter: Getter<FilterRepository>,
  ) {
    super(Asset, datasource);

    this.filter = this.createBelongsToAccessorFor('filter',   filterRepoGetter);
  }

  async updateAll(
    data: DataObject<Asset>,
    where?: Where<Asset>,
    options?: Options,
  ): Promise<Count> {
    data.filterId = undefined;
    return super.updateAll(data, where, options);
  }

}


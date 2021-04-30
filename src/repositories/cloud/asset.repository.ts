import {BelongsToAccessor, Count, DataObject, Getter, juggler, Options, repository, Where} from '@loopback/repository';
import { inject } from '@loopback/core';
import {TimestampedCrudRepository} from '../bases/timestamped-crud-repository';
import {Asset} from '../../models/cloud/asset.model';
import {AssetFilter} from '../../models/cloud/asset-filter.model';
import {AssetFilterRepository} from './asset-filter.repository';


export class AssetRepository extends TimestampedCrudRepository<Asset,typeof Asset.prototype.id> {
  public readonly filter: BelongsToAccessor<AssetFilter, typeof AssetFilter.prototype.id>;

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
    @repository.getter('FilterRepository') filterRepoGetter: Getter<AssetFilterRepository>,
  ) {
    super(Asset, datasource);

    this.filter = this.createBelongsToAccessorFor('filter',   filterRepoGetter);
  }

  async updateAll(
    data: DataObject<Asset>,
    where?: Where<Asset>,
    options?: Options,
  ): Promise<Count> {
    return super.updateAll(data, where, options);
  }

}


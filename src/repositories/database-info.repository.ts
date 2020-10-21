import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import {DatabaseInfo} from '../models/database-info.model';


export class DatabaseInfoRepository extends DefaultCrudRepository<DatabaseInfo,typeof DatabaseInfo.prototype.id> {

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
  ) {
    super(DatabaseInfo, datasource);
    this.datasource.autoupdate()
  }

}


import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import {SwitchData} from '../models/switch-data.model';

export class SwitchDataRepository extends DefaultCrudRepository<SwitchData,typeof SwitchData.prototype.id> {

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
  ) {
    super(SwitchData, datasource);
  }

}


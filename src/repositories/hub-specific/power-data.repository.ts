import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import { PowerData } from '../../models/hub-specific/power-data.model';

export class PowerDataRepository extends DefaultCrudRepository<PowerData,typeof PowerData.prototype.id> {

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
  ) {
    super(PowerData, datasource);
  }

}


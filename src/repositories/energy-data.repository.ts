import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import {EnergyData} from '../models/energy-data.model';


export class EnergyDataRepository extends DefaultCrudRepository<EnergyData,typeof EnergyData.prototype.id> {

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
  ) {
    super(EnergyData, datasource);
  }

}


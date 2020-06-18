import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import { Hub } from '../models/hub.model';
import {DataObject, Options} from '@loopback/repository/src/common-types';


export class HubRepository extends DefaultCrudRepository<Hub,typeof Hub.prototype.id> {

  constructor( @inject('datasources.mongo') protected datasource: juggler.DataSource ) {
    super(Hub, datasource);
  }

  async create(entity: DataObject<Hub>, options?: Options): Promise<Hub> {
    if (await this.isSet() === false) {
      return super.create(entity, options)
    }
    throw "Hub is already registered."
  }

  async isSet() : Promise<boolean> {
    let hubs = await this.find()
    return hubs.length > 0;
  }

  async get() : Promise<Hub | null> {
    let hub = await this.findOne()
    return hub;
  }
}


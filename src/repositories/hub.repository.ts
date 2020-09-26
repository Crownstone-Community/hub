import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import { Hub } from '../models/hub.model';
import {DataObject, Options} from '@loopback/repository/src/common-types';
import {EMPTY_DATABASE} from '../crownstone/Data/DbReference';


export class HubRepository extends DefaultCrudRepository<Hub,typeof Hub.prototype.id> {

  constructor( @inject('datasources.mongo') protected datasource: juggler.DataSource ) {
    super(Hub, datasource);
  }

  async create(entity: DataObject<Hub>, options?: Options): Promise<Hub> {
    if (await this.isSet() === false) {
      if (await this.isSphereSet()) {
        let partialHub = await this.get();
        if (partialHub) {
          if (entity.sphereId !== partialHub?.sphereId) {
            await EMPTY_DATABASE();
          } else {
            await this.delete(partialHub)
          }
        }
        else {
          await EMPTY_DATABASE();
        }
      }
      return super.create(entity, options)
    }
    throw "Hub is already registered."
  }

  async isSphereSet() : Promise<boolean> {
    let hub = await this.get();
    if (hub?.sphereId) {
      return true;
    }
    return false;
  }

  async isSet() : Promise<boolean> {
    let hub = await this.get();
    if (hub && hub.id !== 'null') {
      return true;
    }
    return false;
  }

  async get() : Promise<Hub | null> {
    let hub = await this.findOne()
    return hub;
  }
}


import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import {SphereFeature} from '../../models/hub-specific/sphere-feature.model';


export class SphereFeatureRepository extends DefaultCrudRepository<SphereFeature,typeof SphereFeature.prototype.id> {

  constructor( @inject('datasources.mongo') protected datasource: juggler.DataSource ) {
    super(SphereFeature, datasource);
  }
}


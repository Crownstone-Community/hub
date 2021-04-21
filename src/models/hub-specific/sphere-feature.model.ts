
import {Entity, model, property, hasMany,} from '@loopback/repository';

@model()
export class SphereFeature extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  name: string;

  @property({type: 'string', required: true})
  data: string;

  @property({type: 'boolean', required: true})
  enabled: boolean;

  @property({type: 'date', required: true})
  from?: Date;

  @property({type: 'date', required: true})
  to?: Date;

}

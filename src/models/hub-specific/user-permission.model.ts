import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from './user.model';

@model()
export class UserPermission extends Entity {
  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  operation: string;

  @property({type: 'boolean'})
  permission: boolean;

  @belongsTo(() => User)
  userId: string;

}



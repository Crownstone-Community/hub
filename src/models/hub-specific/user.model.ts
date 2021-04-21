
import {Entity, model, property, hasMany,} from '@loopback/repository';
import {UserPermission} from './user-permission.model';

@model()
export class User extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  userId: string;

  @property({type: 'string', required: true})
  userToken: string;

  @property({type: 'string'})
  firstName?: string;

  @property({type: 'string'})
  lastName?: string;

  @property({type: 'string'})
  sphereRole?: string;

  @hasMany(() => UserPermission)
  permissions: UserPermission[];
}

import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {inject} from '@loopback/core';
import {UserPermission} from '../models/user-permission.model';

export class UserPermissionRepository extends DefaultCrudRepository<UserPermission,typeof UserPermission.prototype.id> {
  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
  ) {
    super(UserPermission, datasource);
  }

}

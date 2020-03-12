// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DefaultCrudRepository, HasManyRepositoryFactory,
  juggler, repository,
} from '@loopback/repository';
import {inject,} from '@loopback/core';
import {User} from '../models/user.model';
import {UserPermission} from '../models';
import {UserPermissionRepository} from './user-permission.repository';
import {DataObject, Options} from '@loopback/repository/src/common-types';
import {HttpErrors} from '@loopback/rest/dist';

export class UserRepository extends DefaultCrudRepository<User,typeof User.prototype.id> {
  public permissions: HasManyRepositoryFactory<UserPermission, typeof User.prototype.id>;

  constructor(
    @repository(UserPermissionRepository) protected userPermissionRepository: UserPermissionRepository,
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
  ) {
    super(User, datasource);
    this.permissions = this.createHasManyRepositoryFactoryFor(
      'permissions',
      async () => userPermissionRepository,
    );
  }

  async create(entity: DataObject<User>, options?: Options): Promise<User> {
    await this.checkUniqueness(entity);
    return super.create(entity, options)
  }
  async save(entity: User, options?: Options): Promise<User> {
    await this.checkUniqueness(entity);
    return super.save(entity, options)
  }

  async checkUniqueness(entity: DataObject<User>) {
    let tokenUniqueness = await this.findOne({where:{userToken: entity.userToken}, fields: {id:true}})
    if (tokenUniqueness !== null) {
      throw new HttpErrors.UnprocessableEntity("UserToken already exists!")
    }
  }

}

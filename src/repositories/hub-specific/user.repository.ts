// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  DefaultCrudRepository, HasManyRepositoryFactory,
  juggler, repository,
} from '@loopback/repository';
import {inject,} from '@loopback/core';
import {UserPermissionRepository} from './user-permission.repository';
import {DataObject, Options} from '@loopback/repository/src/common-types';
import {HttpErrors} from '@loopback/rest/dist';
import {User, UserPermission} from '../../models';

export class UserRepository extends DefaultCrudRepository<User,typeof User.prototype.id> {

  public permissions: HasManyRepositoryFactory<UserPermission, typeof User.prototype.id>;

  constructor(
    @inject('datasources.mongo') protected datasource: juggler.DataSource,
    @repository(UserPermissionRepository) protected userPermissionRepository: UserPermissionRepository,
  ) {
    super(User, datasource);
    this.permissions = this.createHasManyRepositoryFactoryFor('permissions',async () => userPermissionRepository);
  }

  async create(entity: DataObject<User>, options?: Options): Promise<User> {
    await this.checkUniqueness(entity);
    return super.create(entity, options);
  }

  async checkUniqueness(entity: DataObject<User>) {
    let tokenUniqueness = await this.findOne({where:{userToken: entity.userToken}, fields: {id:true}})
    if (tokenUniqueness !== null) {
      throw new HttpErrors.UnprocessableEntity("UserToken already exists!")
    }
  }

  async merge(cloudUserData : cloud_sphereUserDataSet, tokenData: cloud_SphereAuthorizationTokens) {
    let userData : { [key:string] : DataObject<User>} = {};
    let matchingCloudIdMap : map = {};

    let currentUsers = await this.find();

    function prepareUser(sphereUser: cloud_UserData) : DataObject<User> {
      return {
        userId: sphereUser.id,
        userToken: tokenData[sphereUser.id].token,
        firstName: sphereUser.firstName,
        lastName: sphereUser.lastName,
        sphereRole: tokenData[sphereUser.id].role
      }
    }

    cloudUserData.admins.forEach((user)  => { userData[user.id] = prepareUser(user); matchingCloudIdMap[user.id] = false; });
    cloudUserData.members.forEach((user) => { userData[user.id] = prepareUser(user); matchingCloudIdMap[user.id] = false; });
    cloudUserData.guests.forEach((user)  => { userData[user.id] = prepareUser(user); matchingCloudIdMap[user.id] = false; });

    for (let i = 0; i < currentUsers.length; i++) {
      let user = currentUsers[i];
      let data : DataObject<User> = userData[user.userId]
      if (data !== undefined) {
        matchingCloudIdMap[user.userId] = true;
        if (data.userToken)  { user.userToken  = data.userToken;  }
        if (data.sphereRole) { user.sphereRole = data.sphereRole; }
        user.firstName = data.firstName;
        user.lastName  = data.lastName;

        await this.update(user);
      }
      else {
        await this.delete(user);
      }
    }

    let matchingCloudIds = Object.keys(matchingCloudIdMap);
    for (let i = 0; i < matchingCloudIds.length; i++) {
      let id = matchingCloudIds[i];
      if (matchingCloudIdMap[id] === false) {
        await this.create(userData[id])
      }
    }


  }

}

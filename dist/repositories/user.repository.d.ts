import { DefaultCrudRepository, HasManyRepositoryFactory, juggler } from '@loopback/repository';
import { User } from '../models/user.model';
import { UserPermission } from '../models';
import { UserPermissionRepository } from './user-permission.repository';
import { DataObject, Options } from '@loopback/repository/src/common-types';
export declare class UserRepository extends DefaultCrudRepository<User, typeof User.prototype.id> {
    protected userPermissionRepository: UserPermissionRepository;
    protected datasource: juggler.DataSource;
    permissions: HasManyRepositoryFactory<UserPermission, typeof User.prototype.id>;
    constructor(userPermissionRepository: UserPermissionRepository, datasource: juggler.DataSource);
    create(entity: DataObject<User>, options?: Options): Promise<User>;
    checkUniqueness(entity: DataObject<User>): Promise<void>;
    merge(cloudUserData: cloud_sphereUserDataSet, tokenData: cloud_SphereAuthorizationTokens): Promise<void>;
}

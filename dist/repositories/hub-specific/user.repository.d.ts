import { DefaultCrudRepository, HasManyRepositoryFactory, juggler } from '@loopback/repository';
import { UserPermissionRepository } from './user-permission.repository';
import { DataObject, Options } from '@loopback/repository/src/common-types';
import { User, UserPermission } from '../../models';
export declare class UserRepository extends DefaultCrudRepository<User, typeof User.prototype.id> {
    protected datasource: juggler.DataSource;
    protected userPermissionRepository: UserPermissionRepository;
    permissions: HasManyRepositoryFactory<UserPermission, typeof User.prototype.id>;
    constructor(datasource: juggler.DataSource, userPermissionRepository: UserPermissionRepository);
    create(entity: DataObject<User>, options?: Options): Promise<User>;
    checkUniqueness(entity: DataObject<User>): Promise<void>;
    merge(cloudUserData: cloud_sphereUserDataSet, tokenData: cloud_SphereAuthorizationTokens): Promise<void>;
}

import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { UserPermission } from '../models/user-permission.model';
export declare class UserPermissionRepository extends DefaultCrudRepository<UserPermission, typeof UserPermission.prototype.id> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
}

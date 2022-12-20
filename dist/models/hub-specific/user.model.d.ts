import { Entity } from '@loopback/repository';
import { UserPermission } from './user-permission.model';
export declare class User extends Entity {
    id: string;
    userId: string;
    userToken: string;
    firstName?: string;
    lastName?: string;
    sphereRole?: string;
    permissions: UserPermission[];
}

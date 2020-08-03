import { Entity } from '@loopback/repository';
import { UserPermission } from './user-permission.model';
export declare class User extends Entity {
    constructor(data?: Partial<User>);
    id: string;
    userId: string;
    userToken: string;
    firstName?: string;
    lastName?: string;
    permissions: UserPermission[];
}

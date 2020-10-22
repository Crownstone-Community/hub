import { Entity } from '@loopback/repository';
export declare class UserPermission extends Entity {
    id: string;
    operation: string;
    permission: boolean;
    userId: string;
    constructor(data?: Partial<UserPermission>);
}

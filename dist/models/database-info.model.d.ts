import { Entity } from '@loopback/repository';
export declare class DatabaseInfo extends Entity {
    constructor(data?: Partial<DatabaseInfo>);
    id: string;
    version: number;
}

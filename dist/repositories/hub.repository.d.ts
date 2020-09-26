import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Hub } from '../models/hub.model';
import { DataObject, Options } from '@loopback/repository/src/common-types';
export declare class HubRepository extends DefaultCrudRepository<Hub, typeof Hub.prototype.id> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
    create(entity: DataObject<Hub>, options?: Options): Promise<Hub>;
    isSphereSet(): Promise<boolean>;
    isSet(): Promise<boolean>;
    get(): Promise<Hub | null>;
}

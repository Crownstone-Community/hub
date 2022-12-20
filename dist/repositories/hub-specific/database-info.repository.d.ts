import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { DatabaseInfo } from '../../models/hub-specific/database-info.model';
export declare class DatabaseInfoRepository extends DefaultCrudRepository<DatabaseInfo, typeof DatabaseInfo.prototype.id> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
}

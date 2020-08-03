import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { SwitchData } from '../models/switch-data.model';
export declare class SwitchDataRepository extends DefaultCrudRepository<SwitchData, typeof SwitchData.prototype.id> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
}

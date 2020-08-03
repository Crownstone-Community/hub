import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { PowerData } from '../models/power-data.model';
export declare class PowerDataRepository extends DefaultCrudRepository<PowerData, typeof PowerData.prototype.id> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
}

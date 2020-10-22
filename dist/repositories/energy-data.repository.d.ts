import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { EnergyData } from '../models/energy-data.model';
export declare class EnergyDataRepository extends DefaultCrudRepository<EnergyData, typeof EnergyData.prototype.id> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
}

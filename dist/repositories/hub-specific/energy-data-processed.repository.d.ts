import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { EnergyDataProcessed } from '../../models';
export declare class EnergyDataProcessedRepository extends DefaultCrudRepository<EnergyDataProcessed, typeof EnergyDataProcessed.prototype.id> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
    getStoneUIDs(): Promise<number[]>;
}

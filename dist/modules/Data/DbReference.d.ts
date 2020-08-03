import { HubRepository } from '../../repositories/hub.repository';
import { PowerDataRepository } from '../../repositories/power-data.repository';
import { EnergyDataRepository } from '../../repositories/energy-data.repository';
import { UserRepository } from '../../repositories';
declare class DbReferenceClass {
    hub: HubRepository;
    power: PowerDataRepository;
    energy: EnergyDataRepository;
    user: UserRepository;
}
export declare const DbRef: DbReferenceClass;
export {};

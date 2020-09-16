import { EnergyDataProcessedRepository, EnergyDataRepository, HubRepository, PowerDataRepository, SwitchDataRepository, UserRepository } from '../../repositories';
declare class DbReferenceClass {
    hub: HubRepository;
    power: PowerDataRepository;
    energy: EnergyDataRepository;
    energyProcessed: EnergyDataProcessedRepository;
    switches: SwitchDataRepository;
    user: UserRepository;
}
export declare const DbRef: DbReferenceClass;
export {};

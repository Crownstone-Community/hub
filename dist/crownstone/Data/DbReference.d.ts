import { EnergyDataRepository, HubRepository, PowerDataRepository, SwitchDataRepository, UserRepository } from '../../repositories';
declare class DbReferenceClass {
    hub: HubRepository;
    power: PowerDataRepository;
    energy: EnergyDataRepository;
    switches: SwitchDataRepository;
    user: UserRepository;
}
export declare const DbRef: DbReferenceClass;
export {};

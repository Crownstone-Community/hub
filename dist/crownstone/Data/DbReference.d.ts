import { EnergyDataProcessedRepository, EnergyDataRepository, HubRepository, PowerDataRepository, SphereFeatureRepository, SwitchDataRepository, UserPermissionRepository, UserRepository } from '../../repositories';
declare class DbReferenceClass {
    hub: HubRepository;
    power: PowerDataRepository;
    energy: EnergyDataRepository;
    energyProcessed: EnergyDataProcessedRepository;
    sphereFeatures: SphereFeatureRepository;
    switches: SwitchDataRepository;
    user: UserRepository;
    userPermission: UserPermissionRepository;
}
export declare const DbRef: DbReferenceClass;
export declare function EMPTY_DATABASE(): Promise<void>;
export {};

import { DatabaseInfoRepository, EnergyDataRepository, HubRepository, PowerDataRepository, SphereFeatureRepository, SwitchDataRepository, UserPermissionRepository, UserRepository } from '../../repositories';
import { EnergyDataProcessedRepository } from '../../repositories/energy-data-processed.repository';
declare class DbReferenceClass {
    dbInfo: DatabaseInfoRepository;
    hub: HubRepository;
    power: PowerDataRepository;
    energy: EnergyDataRepository;
    energyProcessed: EnergyDataProcessedRepository;
    sphereFeatures: SphereFeatureRepository;
    switches: SwitchDataRepository;
    user: UserRepository;
    userPermission: UserPermissionRepository;
}
export declare const Dbs: DbReferenceClass;
export {};

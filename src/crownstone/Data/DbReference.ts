import {
  DatabaseInfoRepository,
  EnergyDataRepository,
  HubRepository,
  PowerDataRepository,
  SphereFeatureRepository,
  SwitchDataRepository,
  UserPermissionRepository,
  UserRepository,
} from '../../repositories';
import {EnergyDataProcessedRepository} from '../../repositories/hub-specific/energy-data-processed.repository';


class DbReferenceClass {
  dbInfo               : DatabaseInfoRepository
  hub                  : HubRepository
  power                : PowerDataRepository
  energy               : EnergyDataRepository
  energyProcessed      : EnergyDataProcessedRepository
  sphereFeatures       : SphereFeatureRepository
  switches             : SwitchDataRepository
  user                 : UserRepository
  userPermission       : UserPermissionRepository
}
export const Dbs = new DbReferenceClass();

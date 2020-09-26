import {
  EnergyDataProcessedRepository,
  EnergyDataRepository,
  HubRepository,
  PowerDataRepository,
  SphereFeatureRepository,
  SwitchDataRepository,
  UserPermissionRepository,
  UserRepository,
} from '../../repositories';

class DbReferenceClass {
  hub             : HubRepository
  power           : PowerDataRepository
  energy          : EnergyDataRepository
  energyProcessed : EnergyDataProcessedRepository
  sphereFeatures  : SphereFeatureRepository
  switches        : SwitchDataRepository
  user            : UserRepository
  userPermission  : UserPermissionRepository
}
export const DbRef = new DbReferenceClass();

export async function EMPTY_DATABASE() {
  await DbRef.hub.deleteAll();
  await DbRef.user.deleteAll();
  await DbRef.userPermission.deleteAll();
  await DbRef.power.deleteAll();
  await DbRef.energy.deleteAll();
  await DbRef.energyProcessed.deleteAll();
  await DbRef.switches.deleteAll();
  await DbRef.sphereFeatures.deleteAll();
}
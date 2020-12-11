import {
  EnergyDataRepository,
  EnergyDataProcessedRepository,
  HubRepository,
  DatabaseInfoRepository,
  UserRepository,
  UserPermissionRepository,
  SphereFeatureRepository,
  PowerDataRepository,
} from '../../src/repositories';
import {testdb} from "../fixtures/datasources/testdb.datasource";


/**
 * This clears the testDb for all users
 */
export async function clearTestDatabase() {
  let dbInfo          = new DatabaseInfoRepository(testdb);
  let hub             = new HubRepository(testdb);
  let userPermission  = new UserPermissionRepository(testdb);
  let user            = new UserRepository(testdb, userPermission);
  let sphereFeatures  = new SphereFeatureRepository(testdb);
  let power           = new PowerDataRepository(testdb);
  let energy          = new EnergyDataRepository(testdb);
  let energyProcessed = new EnergyDataProcessedRepository(testdb);

  await dbInfo.deleteAll()
  await hub.deleteAll()
  await userPermission.deleteAll()
  await user.deleteAll()
  await sphereFeatures.deleteAll()
  await power.deleteAll()
  await energy.deleteAll()
  await energyProcessed.deleteAll()

}

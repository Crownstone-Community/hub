import {EnergyDataRepository, EnergyDataProcessedRepository} from '../../src/repositories';
import {testdb} from "../fixtures/datasources/testdb.datasource";


/**
 * This clears the testDb for all users
 */
export async function clearTestDatabase() {
  let energyRepository = new EnergyDataRepository(testdb);
  let energyProcessedRepository = new EnergyDataProcessedRepository(testdb);

  await energyRepository.deleteAll();
  await energyProcessedRepository.deleteAll();
}

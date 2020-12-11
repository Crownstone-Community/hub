import {CrownstoneHubApplication} from '../../src';
import {testdb} from "../fixtures/datasources/testdb.datasource";
import {Dbs} from '../../src/crownstone/Data/DbReference';
import {
  DatabaseInfoRepository,
  EnergyDataProcessedRepository,
  EnergyDataRepository,
  HubRepository,
  PowerDataRepository,
  SphereFeatureRepository,
  UserPermissionRepository,
  UserRepository,
} from '../../src/repositories';
import {CONFIG} from '../../src/config';

jest.mock('../../src/crownstone/Data/DbUtil', () => {
  return { EMPTY_DATABASE: jest.fn() }
})

export async function createApp() : Promise<CrownstoneHubApplication> {
  Error.stackTraceLimit = 100;

  CONFIG.enableUart = false;

  let app = new CrownstoneHubApplication({
    rest: {port: 0},
    customPath: __dirname + "/../../src"
  });
  app.dataSource(testdb, 'testdb')
  await app.boot();
  app.bind('datasources.mongo').to(testdb);
  await app.start();
  await setupDbRef(app);
  return app;
}

async function setupDbRef(app : CrownstoneHubApplication) {
  Dbs.dbInfo          = await app.getRepository(DatabaseInfoRepository);
  Dbs.hub             = await app.getRepository(HubRepository);
  Dbs.user            = await app.getRepository(UserRepository);
  Dbs.userPermission  = await app.getRepository(UserPermissionRepository);
  Dbs.sphereFeatures  = await app.getRepository(SphereFeatureRepository);
  Dbs.power           = await app.getRepository(PowerDataRepository);
  Dbs.energy          = await app.getRepository(EnergyDataRepository);
  Dbs.energyProcessed = await app.getRepository(EnergyDataProcessedRepository);
}
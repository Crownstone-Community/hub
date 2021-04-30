import {CONFIG} from '../../src/config';
CONFIG.enableUart = false;


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
import {AssetFilterSetRepository} from '../../src/repositories/cloud/asset-filter-set.repository';
import {AssetFilterRepository} from '../../src/repositories/cloud/asset-filter.repository';
import {AssetRepository} from '../../src/repositories/cloud/asset.repository';
import {WebhookRepository} from '../../src/repositories/hub-specific/webhook.repository';


jest.mock('../../src/crownstone/Data/DbUtil', () => {
  return { EMPTY_DATABASE: jest.fn() }
})

export async function createApp() : Promise<CrownstoneHubApplication> {
  Error.stackTraceLimit = 100;

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
  Dbs.assets          = await app.getRepository(AssetRepository);
  Dbs.assetFilters    = await app.getRepository(AssetFilterRepository);
  Dbs.assetFilterSets = await app.getRepository(AssetFilterSetRepository);
  Dbs.webhooks        = await app.getRepository(WebhookRepository);
}
import {CrownstoneHubApplication} from '../../src';
import {testdb} from "../fixtures/datasources/testdb.datasource";
import {DbRef} from '../../src/crownstone/Data/DbReference';
import {EnergyDataRepository, EnergyDataProcessedRepository} from '../../src/repositories';


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
  DbRef.energy          = await app.getRepository(EnergyDataRepository);
  DbRef.energyProcessed = await app.getRepository(EnergyDataProcessedRepository);
}
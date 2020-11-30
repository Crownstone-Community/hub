import {CrownstoneHubApplication, updateLoggingBasedOnConfig} from './application';
import {
  DatabaseInfoRepository,
  EnergyDataRepository,
  HubRepository,
  PowerDataRepository,
  SphereFeatureRepository,
  SwitchDataRepository,
  UserPermissionRepository,
  UserRepository,
} from './repositories';
import {Dbs, EMPTY_DATABASE} from './crownstone/Data/DbReference';
import {CrownstoneHub} from './crownstone/CrownstoneHub';
// import {MongoDbConnector} from './datasources/mongoDriver';

import {ApplicationConfig, ExpressServer} from './server';
import {Logger} from './Logger';
import {EnergyDataProcessedRepository} from './repositories/energy-data-processed.repository';
import {MongoDbConnector} from './datasources/mongoDriver';

const log = Logger(__filename);

export {CrownstoneHubApplication};
Error.stackTraceLimit = 100;

export async function main(options: ApplicationConfig = {}) {
  updateLoggingBasedOnConfig()

  log.info(`Creating Server...`);
  const server = new ExpressServer();
  log.info(`Server Booting...`);
  await server.boot();
  log.info(`Server starting...`);
  await server.start();
  log.info(`Server started.`);

  log.info(`Creating Database References...`);
  Dbs.dbInfo            = await server.lbApp.getRepository(DatabaseInfoRepository)
  Dbs.hub               = await server.lbApp.getRepository(HubRepository)
  Dbs.power             = await server.lbApp.getRepository(PowerDataRepository)
  Dbs.energy            = await server.lbApp.getRepository(EnergyDataRepository)
  Dbs.energyProcessed   = await server.lbApp.getRepository(EnergyDataProcessedRepository)
  Dbs.user              = await server.lbApp.getRepository(UserRepository)
  Dbs.userPermission    = await server.lbApp.getRepository(UserPermissionRepository)
  Dbs.switches          = await server.lbApp.getRepository(SwitchDataRepository)
  Dbs.sphereFeatures    = await server.lbApp.getRepository(SphereFeatureRepository)

  await migrate();
  await maintainIndexes();

  log.info(`Initializing CrownstoneHub...`);
  await CrownstoneHub.initialize();
  //
  // console.log(`Server is running at ${host}:${port}`);
  log.info(`Server initialized!`);

  // setTimeout(() => { app.controller(MeshController)}, 10000)
  return server.lbApp;;
}


async function migrate() {
  console.time("migrate")
  let databaseInfo = await Dbs.dbInfo.findOne();
  if (databaseInfo === null) {
    await Dbs.dbInfo.create({version: 0});
    databaseInfo = await Dbs.dbInfo.findOne();
  }

  // this won't happen but it makes the typescript happy!
  if (databaseInfo === null) { return; }
  if (databaseInfo.version === 0) {
    let noIntervalCount = await Dbs.energyProcessed.count();
    if (noIntervalCount.count > 0) {
      await Dbs.energyProcessed.updateAll({interval:"1m"});
    }
    databaseInfo.version = 1;
    await Dbs.dbInfo.update(databaseInfo);
  }
  console.timeEnd("migrate")
}

async function maintainIndexes() {
  const connector = new MongoDbConnector()
  await connector.connect();
  const processedEnergyCollection = connector.db.collection('EnergyDataProcessed');
  console.time('index')
  processedEnergyCollection.createIndexes([
    {key:{stoneUID: 1, interval:1}},
    {key:{stoneUID: 1, interval:1, timestamp: 1}},
    {key:{stoneUID: 1, interval:1, timestamp: -1}},
  ]);
  console.timeEnd('index')
}
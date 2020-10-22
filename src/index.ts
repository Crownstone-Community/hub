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
import {DbRef, EMPTY_DATABASE} from './crownstone/Data/DbReference';
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
  DbRef.dbInfo            = await server.lbApp.getRepository(DatabaseInfoRepository)
  DbRef.hub               = await server.lbApp.getRepository(HubRepository)
  DbRef.power             = await server.lbApp.getRepository(PowerDataRepository)
  DbRef.energy            = await server.lbApp.getRepository(EnergyDataRepository)
  DbRef.energyProcessed   = await server.lbApp.getRepository(EnergyDataProcessedRepository)
  DbRef.user              = await server.lbApp.getRepository(UserRepository)
  DbRef.userPermission    = await server.lbApp.getRepository(UserPermissionRepository)
  DbRef.switches          = await server.lbApp.getRepository(SwitchDataRepository)
  DbRef.sphereFeatures    = await server.lbApp.getRepository(SphereFeatureRepository)

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
  let databaseInfo = await DbRef.dbInfo.findOne();
  if (databaseInfo === null) {
    await DbRef.dbInfo.create({version: 0});
    databaseInfo = await DbRef.dbInfo.findOne();
  }

  // this won't happen but it makes the typescript happy!
  if (databaseInfo === null) { return; }
  if (databaseInfo.version === 0) {
    let noIntervalCount = await DbRef.energyProcessed.count();
    if (noIntervalCount.count > 0) {
      await DbRef.energyProcessed.updateAll({interval:"1m"});
    }
    databaseInfo.version = 1;
    await DbRef.dbInfo.update(databaseInfo);
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
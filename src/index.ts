import {CrownstoneHubApplication, updateLoggingBasedOnConfig} from './application';
import {
  EnergyDataProcessedRepository,
  EnergyDataRepository,
  HubRepository,
  PowerDataRepository,
  SphereFeatureRepository,
  SwitchDataRepository, UserPermissionRepository,
  UserRepository,
} from './repositories';
import {DbRef, EMPTY_DATABASE} from './crownstone/Data/DbReference';
import {CrownstoneHub} from './crownstone/CrownstoneHub';
// import {MongoDbConnector} from './datasources/mongoDriver';

import {ApplicationConfig, ExpressServer} from './server';
import {Logger} from './Logger';

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
  DbRef.hub             = await server.lbApp.getRepository(HubRepository)
  DbRef.power           = await server.lbApp.getRepository(PowerDataRepository)
  DbRef.energy          = await server.lbApp.getRepository(EnergyDataRepository)
  DbRef.energyProcessed = await server.lbApp.getRepository(EnergyDataProcessedRepository)
  DbRef.user            = await server.lbApp.getRepository(UserRepository)
  DbRef.userPermission  = await server.lbApp.getRepository(UserPermissionRepository)
  DbRef.switches        = await server.lbApp.getRepository(SwitchDataRepository)
  DbRef.sphereFeatures  = await server.lbApp.getRepository(SphereFeatureRepository)

  // const connector = new MongoDbConnector()
  // await connector.connect();
  // const energyCollection = connector.db.collection('EnergyData');
  // console.time('index')
  // energyCollection.createIndexes([
  //   {key:{uploaded:1, stoneUID: 1, timestamp: 1}},
  // ]);
  // console.timeEnd('index')

  log.info(`Initializing CrownstoneHub...`);
  await CrownstoneHub.initialize();
  //
  // console.log(`Server is running at ${host}:${port}`);
  log.info(`Server initialized!`);

  // setTimeout(() => { app.controller(MeshController)}, 10000)
  return server.lbApp;;
}

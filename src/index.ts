import {CrownstoneHubApplication} from './application';
import * as fs from 'fs';
import {verifyCertificate} from './security/VerifyCertificates';
import {EnergyDataProcessedRepository, EnergyDataRepository, HubRepository, PowerDataRepository, SwitchDataRepository, UserRepository} from './repositories';
import {DbRef} from './crownstone/Data/DbReference';
import {CrownstoneHub} from './crownstone/CrownstoneHub';
// import {MongoDbConnector} from './datasources/mongoDriver';

import {ApplicationConfig, ExpressServer} from './server';

export {CrownstoneHubApplication};
Error.stackTraceLimit = 100;

export async function main(options: ApplicationConfig = {}) {
  const server = new ExpressServer();
  await server.boot();
  await server.start();

  const port = server.lbApp.restServer.config.port ?? 3000;
  const host = server.lbApp.restServer.config.host ?? 'NO-HOST';

  DbRef.hub             = await server.lbApp.getRepository(HubRepository)
  DbRef.power           = await server.lbApp.getRepository(PowerDataRepository)
  DbRef.energy          = await server.lbApp.getRepository(EnergyDataRepository)
  DbRef.energyProcessed = await server.lbApp.getRepository(EnergyDataProcessedRepository)
  DbRef.user            = await server.lbApp.getRepository(UserRepository)
  DbRef.switches        = await server.lbApp.getRepository(SwitchDataRepository)

  // const connector = new MongoDbConnector()
  // await connector.connect();
  // const energyCollection = connector.db.collection('EnergyData');
  // console.time('index')
  // energyCollection.createIndexes([
  //   {key:{uploaded:1, stoneUID: 1, timestamp: 1}},
  // ]);
  // console.timeEnd('index')

  await CrownstoneHub.initialize();

  console.log(`Server is running at ${host}:${port}`);


  // setTimeout(() => { app.controller(MeshController)}, 10000)
  return server.lbApp;;
}

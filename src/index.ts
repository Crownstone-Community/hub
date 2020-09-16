import {CrownstoneHubApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import * as fs from 'fs';
import {verifyCertificate} from './security/VerifyCertificates';
import {EnergyDataProcessedRepository, EnergyDataRepository, HubRepository, PowerDataRepository, SwitchDataRepository, UserRepository} from './repositories';
import {DbRef} from './crownstone/Data/DbReference';
import {CrownstoneHub} from './crownstone/CrownstoneHub';
// import {MongoDbConnector} from './datasources/mongoDriver';

export {CrownstoneHubApplication};
Error.stackTraceLimit = 100;
export async function main(options: ApplicationConfig = {}) {
  let path = await verifyCertificate();

  let httpsOptions = {
    rest: {
      ...options.rest,
      protocol: 'https',
      key:  fs.readFileSync(path + '/key.pem'),
      cert: fs.readFileSync(path + '/cert.pem'),
    },
  };

  const app = new CrownstoneHubApplication(httpsOptions);
  await app.boot();
  await app.start();

  const url = app.restServer.url;

  DbRef.hub             = await app.getRepository(HubRepository)
  DbRef.power           = await app.getRepository(PowerDataRepository)
  DbRef.energy          = await app.getRepository(EnergyDataRepository)
  DbRef.energyProcessed = await app.getRepository(EnergyDataProcessedRepository)
  DbRef.user            = await app.getRepository(UserRepository)
  DbRef.switches        = await app.getRepository(SwitchDataRepository)

  // const connector = new MongoDbConnector()
  // await connector.connect();
  // const energyCollection = connector.db.collection('EnergyData');
  // console.time('index')
  // energyCollection.createIndexes([
  //   {key:{uploaded:1, stoneUID: 1, timestamp: 1}},
  // ]);
  // console.timeEnd('index')


  await CrownstoneHub.initialize();



  console.log(`Server is running at ${url}`);

  return app;
}

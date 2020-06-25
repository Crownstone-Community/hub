import {CrownstoneHubApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import * as fs from 'fs';
import {verifyCertificate} from './security/VerifyCertificates';
import {HubRepository} from './repositories/hub.repository';
import {PowerDataRepository} from './repositories/power-data.repository';
import {EnergyDataRepository} from './repositories/energy-data.repository';
import {CrownstoneHub} from './modules/CrownstoneHub';
import {DbRef} from './modules/Data/DbReference';
import {UserRepository} from './repositories';

export {CrownstoneHubApplication};

export async function main(options: ApplicationConfig = {}) {
  await verifyCertificate();

  let httpsOptions = {
    rest: {
      ...options.rest,
      protocol: 'https',
      key:  fs.readFileSync('./src/https/key.pem'),
      cert: fs.readFileSync('./src/https/cert.pem'),
    },
  };

  const app = new CrownstoneHubApplication(httpsOptions);
  await app.boot();
  await app.start();

  const url = app.restServer.url;

  DbRef.hub    = await app.getRepository(HubRepository)
  DbRef.power  = await app.getRepository(PowerDataRepository)
  DbRef.energy = await app.getRepository(EnergyDataRepository)
  DbRef.user   = await app.getRepository(UserRepository)

  await CrownstoneHub.initialize();

  console.log(`Server is running at ${url}`);

  return app;
}

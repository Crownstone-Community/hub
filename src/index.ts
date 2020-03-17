import {CrownstoneHubApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import * as fs from 'fs';
import {verifyCertificate} from './security/VerifyCertificates';
import {LaunchModules} from './modules';

export {CrownstoneHubApplication};



export async function main(options: ApplicationConfig = {}) {
  await verifyCertificate();

  await LaunchModules();


  let httpsOptions = {
    rest: {
      ...options.rest,
      protocol: 'https',
      key:  fs.readFileSync('./src/https/key.pem'),
      cert: fs.readFileSync('./src/https/cert.pem'),
    },
  }

  const app = new CrownstoneHubApplication(httpsOptions);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);

  return app;
}

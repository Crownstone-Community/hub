// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {once} from 'events';
import express, {Request, Response} from 'express';
import https from 'https';
import path from 'path';
import {CrownstoneHubApplication, updateControllersBasedOnConfig} from './application';
import { ApplicationConfig } from '@loopback/core';
import fs from "fs";
import {verifyCertificate} from './security/VerifyCertificates';
import {Logger} from './Logger';
import {applyCustomRoutes} from './customRoutes/ApplyCustomRoutes';

export {ApplicationConfig};

const log = Logger(__filename);

const config = {
  rest: {
    // Use the LB4 application as a route. It should not be listening.
    listenOnStart: false,
  },
};

export class ExpressServer {
  public readonly app: express.Application;
  public readonly lbApp: CrownstoneHubApplication;
  private server?: https.Server;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();
    this.lbApp = new CrownstoneHubApplication(config);

    // Expose the front-end assets via Express, not as LB4 route
    this.app.use('/api', this.lbApp.requestHandler);

    applyCustomRoutes(this.app, this.lbApp);

    // Custom Express routes
    this.app.get('/', function (_req: Request, res: Response) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });



    // Serve static files in the public folder
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  public async boot() {
    await this.lbApp.boot();
  }

  public async start() {
    await this.lbApp.start();
    updateControllersBasedOnConfig(this.lbApp);
    const port = this.lbApp.restServer.config.port ?? 3000;

    let path = await verifyCertificate();

    let httpsOptions = {
      protocol: 'https',
      key:  fs.readFileSync(path + '/key.pem'),
      cert: fs.readFileSync(path + '/cert.pem'),
    };

    this.server = https.createServer(httpsOptions, this.app).listen(port, () => {
      log.info("Hub is available at https://<hub-ip-address>:5050")
    });
    await once(this.server, 'listening');
  }

  // For testing purposes
  public async stop() {
    if (!this.server) return;
    await this.lbApp.stop();
    this.server.close();
    await once(this.server, 'close');
    this.server = undefined;
  }
}

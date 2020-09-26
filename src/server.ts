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
import {extractToken} from './security/authentication-strategies/csToken-strategy';
import {HttpErrors} from '@loopback/rest';
import {checkAccessToken} from './services';
import {DbRef} from './crownstone/Data/DbReference';
import {getHubConfig, storeHubConfig} from './util/ConfigUtil';
import {Logger} from './Logger';

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

    // Custom Express routes
    this.app.get('/', function (_req: Request, res: Response) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    this.app.get('/enableLogging',async (req: Request, res: Response) => {
      try {
        let access_token = extractToken(req);
        let userData = await checkAccessToken(access_token, DbRef.user);
        if (userData.sphereRole === 'admin') {
          let config = getHubConfig();
          config.useLogControllers = true;
          storeHubConfig(config);
          updateControllersBasedOnConfig(this.lbApp);
          res.end("Command accepted. LoggingController is now enabled.");
        }
      }
      catch(e) {
        res.end(JSON.stringify(new HttpErrors.Unauthorized()))
      }
    });
    this.app.get('/disableLogging',async (req: Request, res: Response) => {
      try {
        let access_token = extractToken(req);
        let userData = await checkAccessToken(access_token, DbRef.user);
        if (userData.sphereRole === 'admin') {
          let config = getHubConfig();
          config.useLogControllers = false;
          storeHubConfig(config);
          res.end("Command accepted. LoggingController will be disabled. Changed will take effect on next reboot.");
          setTimeout(() => {
            process.exit()
          }, 2000);
        }
      }
      catch(e) {
        res.end(JSON.stringify(new HttpErrors.Unauthorized()))
      }
    });

    this.app.get('/vis',async (req: Request, res: Response) => {
      try {
        let access_token = extractToken(req);
        let userData = await checkAccessToken(access_token, DbRef.user);
        if (userData) {
          res.sendFile(path.join(__dirname, '../public/energyViewer/index.html'));
        }
      }
      catch(e) {
        res.end(JSON.stringify(new HttpErrors.Unauthorized()))
      }
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

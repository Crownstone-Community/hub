// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {once} from 'events';
import express, {Request, Response} from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { ApplicationConfig } from '@loopback/core';
import {Logger} from './Logger';
import {getIpAddress} from './util/HubUtil';
import {getHttpPort, getHttpsPort} from './util/ConfigUtil';

export {ApplicationConfig};

const log = Logger(__filename);

const config = {
  rest: {
    // Use the LB4 application as a route. It should not be listening.
    listenOnStart: false,
  },
};

export class PublicExpressServer {
  public readonly app: express.Application;
  private server?: http.Server;

  httpPort : number;
  httpsPort : number;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();
    this.app.use(cors());

    this.httpPort = getHttpPort();
    this.httpsPort = getHttpsPort();

    // Custom Express routes
    this.app.get('/', function (req: Request, res: Response) {
      res.sendFile(path.join(__dirname, '../public/http/index.html'));
    });

    this.app.get('/forward', (req: Request, res: Response) => {
      let ipAddress = getIpAddress();
      res.writeHead(302, {
        Location: `https://${ipAddress}:${this.httpsPort}/`
      });
      res.end();
    });

    // Serve static files in the public folder
    this.app.use(express.static(path.join(__dirname, '../public/http')));
  }

  public async start() {
    this.server = http.createServer(this.app).listen(this.httpPort, () => {
      let ipAddress = getIpAddress();
      log.info(`Hub is available at http://${ipAddress}:${this.httpPort}`)
    });
    await once(this.server, 'listening');
  }

  // For testing purposes
  public async stop() {
    if (!this.server) return;
    this.server.close();
    await once(this.server, 'close');
    this.server = undefined;
  }
}

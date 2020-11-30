import express, {Request, Response} from 'express';
import {extractToken} from '../security/authentication-strategies/csToken-strategy';
import {checkAccessToken} from '../services';
import {Dbs} from '../crownstone/Data/DbReference';
import {getHubConfig, storeHubConfig} from '../util/ConfigUtil';
import {CrownstoneHubApplication, updateControllersBasedOnConfig} from '../application';
import {HttpErrors} from '@loopback/rest';

export function addDeveloperRoutes(app : express.Application, loopbackApp: CrownstoneHubApplication) {
  app.get('/enableDeveloperMode',async (req: Request, res: Response) => {
    try {
      let access_token = extractToken(req);
      let userData = await checkAccessToken(access_token, Dbs.user);
      if (userData.sphereRole === 'admin') {
        let config = getHubConfig();
        config.useDevControllers = true;
        storeHubConfig(config);
        updateControllersBasedOnConfig(loopbackApp);
        res.end("Command accepted. DebuggingController is now enabled.");
      }
    }
    catch(e) {
      res.end(JSON.stringify(new HttpErrors.Unauthorized()))
    }
  });

  app.get('/disableDeveloperMode',async (req: Request, res: Response) => {
    try {
      let access_token = extractToken(req);
      let userData = await checkAccessToken(access_token, Dbs.user);
      if (userData.sphereRole === 'admin') {
        let config = getHubConfig();
        config.useDevControllers = false;
        storeHubConfig(config);
        res.end("Command accepted. DebuggingController will be disabled. Changed will take effect on next reboot.");
        setTimeout(() => {
          process.exit()
        }, 2000);
      }
    }
    catch(e) {
      res.end(JSON.stringify(new HttpErrors.Unauthorized()))
    }
  });
}
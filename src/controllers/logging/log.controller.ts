// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {del, get, getModelSchemaRef, HttpErrors, oas, param, post, requestBody, Response, RestBindings} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';
import {Logger} from '../../Logger';
import {inject} from '@loopback/context';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../../security/authentication-strategies/csToken-strategy';
import {EmptyReturnCode} from '../returnCodes/ReturnCodes';
import * as fs from 'fs';
import {getHubConfig, storeHubConfig} from '../../util/ConfigUtil';
import path from 'path';
import {SecurityTypes} from '../../constants/Constants';
import {updateLoggingBasedOnConfig} from '../../application';

const log = Logger(__filename);

let AVAILABLE_LEVELS = ["none" , "critical" , "error" , "warn" , "notice" , "info" , "debug" , "verbose" , "silly"];

interface LogFileDetails {
  filename: string,
  sizeMB: number
}

export class LogController {
  constructor() {}


  @get('/individualLogLevels')
  @authenticate(SecurityTypes.admin)
  async getLoggers(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<any> {
    let loggerIds = log.config.getLoggerIds();

    let data : any = {};
    loggerIds.forEach((loggerId) => {
      let transport = log.config.getTransportForLogger(loggerId);
      data[loggerId] = {console: transport?.console.level || "info", file: transport?.file?.level || 'none'};
    })
    return data;
  }


  @post('/individualLogLevels', EmptyReturnCode)
  @authenticate(SecurityTypes.admin)
  async setIndividualLevels(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @requestBody( {'application/json': { example: {loggerId: {console: 'info', file: 'none'}} }}) loggerConfig: any,
  ) : Promise<any> {
    let loggerIds = log.config.getLoggerIds();
    let providedKeys = Object.keys(loggerConfig);
    let hubConfig = getHubConfig();
    for (let i = 0; i < providedKeys.length; i++) {
      let loggerId = providedKeys[i];
      let levels = loggerConfig[loggerId];
      if (loggerIds.indexOf(loggerId) === -1) {
        throw new HttpErrors.BadRequest("Invalid loggerId:" + loggerId);
      }

      let currentLevels = hubConfig.logging[loggerId];
      if (!currentLevels) {
        currentLevels = {
          console: (process.env.CS_CONSOLE_LOGGING_LEVEL || 'info') as TransportLevel,
          file:    (process.env.CS_FILE_LOGGING_LEVEL    || 'info') as TransportLevel,
        };
      }

      // restore defaults and remove override.
      if (levels === null || levels === 'null') {
        let transports = log.config.getTransportForLogger(loggerId);
        if (transports) {
          transports.console.level = (process.env.CS_CONSOLE_LOGGING_LEVEL || 'info') as TransportLevel;
          if (transports.file) {
            transports.file.level = (process.env.CS_FILE_LOGGING_LEVEL || 'info') as TransportLevel;
          }
        }
        delete hubConfig.logging[loggerId];
        continue;
      }

      if (levels.console) {
        if (AVAILABLE_LEVELS.indexOf(levels.console) === -1) {
          throw new HttpErrors.BadRequest("Invalid level:" + levels.console);
        }
        currentLevels.console = levels.console;
      }
      if (levels.file) {
        if (AVAILABLE_LEVELS.indexOf(levels.file) === -1) {
          throw new HttpErrors.BadRequest("Invalid level:" + levels.file);
        }
        currentLevels.file = levels.file;
      }
      hubConfig.logging[loggerId] = currentLevels;
    }
    storeHubConfig(hubConfig);
    updateLoggingBasedOnConfig();
  }

  @del('/individualLogLevels', EmptyReturnCode)
  @authenticate(SecurityTypes.admin)
  async clearIndividualLevels(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<any> {
    let hubConfig = getHubConfig();
    let providedKeys = Object.keys(hubConfig.logging);
    let loggerIds = log.config.getLoggerIds();

    for (let i = 0; i < providedKeys.length; i++) {
      let loggerId = providedKeys[i];
      if (loggerIds.indexOf(loggerId) === -1) {
        continue;
      }

      // restore defaults and remove override.
      let transports = log.config.getTransportForLogger(loggerId);
      if (transports) {
        transports.console.level = (process.env.CS_CONSOLE_LOGGING_LEVEL || 'info') as TransportLevel;
        if (transports.file) {
          transports.file.level = (process.env.CS_FILE_LOGGING_LEVEL || 'info') as TransportLevel;
        }
      }
      continue;
    }
    hubConfig.logging = {};
    storeHubConfig(hubConfig);
  }


  @get('/availableLogFiles', EmptyReturnCode)
  @authenticate(SecurityTypes.admin)
  async availableLogFiles(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<LogFileDetails[]> {
    let logPath = process.env.CS_FILE_LOGGING_DIRNAME;
    if (!logPath || logPath === undefined)  { return []; }
    if (!fs.existsSync(logPath))            { return []; }

    let items = fs.readdirSync(logPath);

    let logItems : LogFileDetails[] = [];
    let expectedFileBase = process.env.CS_FILE_LOGGING_BASENAME || 'crownstone-log';
    items.forEach((item) => {
      if (item.indexOf(expectedFileBase + "-2") !== -1) {
        let stats = fs.statSync(path.join(logPath as string, item));
        var fileSizeInBytes = stats["size"]
        logItems.push({filename: item, sizeMB: fileSizeInBytes/Math.pow(1024,2)});
      }
    })

    return logItems
  }

  @get('/downloadLogFile')
  @authenticate(SecurityTypes.admin)
  @oas.response.file()
  async downloadLogFile(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.string('filename', {required:true}) filename: string,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ) {
    if (!filename)  { throw new HttpErrors.notFound(); }

    const fileBasename = path.basename(filename);
    let logPath = process.env.CS_FILE_LOGGING_DIRNAME;

    if (!fileBasename)                                              { throw new HttpErrors.notFound(); }
    if (!logPath || logPath === undefined)                          { throw new HttpErrors.notFound(); }
    if (!fs.existsSync(path.join(logPath as string, fileBasename))) { throw new HttpErrors.NotFound(); }

    // @ts-ignore
    response.download(path.join(logPath as string, fileBasename));
    return response;
  }

  @del('/deleteAllLogs', EmptyReturnCode)
  @authenticate(SecurityTypes.admin)
  async deleteAllLogs(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<void> {
    let logPath = process.env.CS_FILE_LOGGING_DIRNAME;
    if (!logPath || logPath === undefined)  { return; }
    if (!fs.existsSync(logPath))            { return; }

    let items = fs.readdirSync(logPath);
    let expectedFileBase = process.env.CS_FILE_LOGGING_BASENAME || 'crownstone-log';
    items.forEach((item) => {
      if (item.indexOf(expectedFileBase + "-2") !== -1) {
        fs.unlinkSync(path.join(logPath as string, item))
      }
    });
  }
}

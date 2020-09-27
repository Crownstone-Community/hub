// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, HttpErrors, oas, param, post, Response, RestBindings} from '@loopback/rest';
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

const log = Logger(__filename);

let AVAILABLE_LEVELS = ["none" , "critical" , "error" , "warn" , "notice" , "info" , "debug" , "verbose" , "silly"];

interface LogFileDetails {
  filename: string,
  sizeMB: number
}

export class LogController {
  constructor() {}


  @post('/setLogLevel', EmptyReturnCode)
  @authenticate(SecurityTypes.admin)
  async setLogLevel(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.string('consoleLevel', {required:false}) consoleLevel: string,
    @param.query.string('fileLevel', {required:false}) fileLevel: string,
  ) : Promise<void> {
    if (consoleLevel && AVAILABLE_LEVELS.indexOf(consoleLevel) === -1) {
      throw new HttpErrors.BadRequest("consoleLevel must be one of these: " + AVAILABLE_LEVELS.join(", "));
    }
    if (fileLevel && AVAILABLE_LEVELS.indexOf(fileLevel) === -1) {
      throw new HttpErrors.BadRequest("fileLevel must be one of these: " + AVAILABLE_LEVELS.join(", "));
    }
    let hubConfig = getHubConfig();
    if (consoleLevel) {
      hubConfig.logging.consoleLevel = consoleLevel as TransportLevel;
      log.config.setConsoleLevel(consoleLevel as TransportLevel);
    };
    if (fileLevel)    {
      hubConfig.logging.fileLevel = fileLevel as TransportLevel;
      log.config.setFileLevel(fileLevel as TransportLevel);
    };
    storeHubConfig(hubConfig);
  }

  @post('/setFileLogging', EmptyReturnCode)
  @authenticate(SecurityTypes.admin)
  async setFileLogging(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.boolean('enabled', {required:true}) enabled: boolean,
  ) : Promise<void> {
    let hubConfig = getHubConfig();
    hubConfig.logging.fileLoggingEnabled = enabled;
    log.config.setFileLogging(enabled);
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

  @get('/deleteAllLogs', EmptyReturnCode)
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

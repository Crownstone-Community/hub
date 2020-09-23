// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, HttpErrors, param, post, requestBody} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';
import {Logger} from '../../Logger';
import {inject} from '@loopback/context';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../../security/authentication-strategies/csToken-strategy';
import {EmptyReturnCode} from '../returnCodes/ReturnCodes';
import {CrownstoneHub} from '../../crownstone/CrownstoneHub';

const log = Logger(__filename);

let AVAILABLE_LEVELS = ["none" , "critical" , "error" , "warn" , "notice" , "info" , "debug" , "verbose" , "silly"];

export class LogController {
  constructor() {}


  @post('/setLogLevel', EmptyReturnCode)
  @authenticate('csAdminToken')
  async setLogLevel(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.string('level', {required:true}) level: string,
  ) : Promise<void> {
    if (AVAILABLE_LEVELS.indexOf(level) !== -1) {
      log.config.setLevel(level as TransportLevel);
    }
    else {
      throw new HttpErrors.BadRequest("Level must be one of these: " + AVAILABLE_LEVELS.join(", "));
    }
  }

  @post('/setFileLogging', EmptyReturnCode)
  @authenticate('csAdminToken')
  async setFileLogging(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.boolean('enabled', {required:true}) enabled: boolean,
  ) : Promise<void> {
    log.config.setFileLogging(enabled);
  }

  @get('/availableLogFiles', EmptyReturnCode)
  @authenticate('csAdminToken')
  async availableLogFiles(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<string[]> {
    return []
  }

  @get('/downloadLogFile', EmptyReturnCode)
  @authenticate('csAdminToken')
  async downloadLogFile(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.string('filename', {required:true}) filename: string,
  ) : Promise<string[]> {
    return []
  }

  @get('/deleteAllLogs', EmptyReturnCode)
  @authenticate('csAdminToken')
  async deleteAllLogs(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ) : Promise<void> {
    return;
  }
}

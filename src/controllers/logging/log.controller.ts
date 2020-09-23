// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, post, requestBody} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';
import {Logger} from '../../Logger';

const log = Logger(__filename);

export class LogController {
  constructor() {}


  @post('/setLogLevel')
  @authenticate('csTokens')
  async setLogLevel() : Promise<void> {
    return;
  }
}

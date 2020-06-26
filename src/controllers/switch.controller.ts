import {param, post} from '@loopback/rest';
import {HttpErrors} from '@loopback/rest/dist';
import {EmptyReturnCode} from './returnCodes/ReturnCodes';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {SecurityBindings} from '@loopback/security';
import {CrownstoneHub} from '../crownstone/CrownstoneHub';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';


export class SwitchController {
  constructor() {}

  @post('/switch', EmptyReturnCode)
  @authenticate('csTokens')
  async switchCrownstone(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
    @param.query.number('switchState',   {required:true}) switchState:   number,
  ) : Promise<void> {
    if (switchState < 0 || switchState > 1) {
      throw new HttpErrors.UnprocessableEntity("Switch state must be between 0 and 1.")
    }
    await CrownstoneHub.uart.switchCrownstones([{crownstoneId: crownstoneUID, switchState: switchState}])
  }


  @post('/switchMultiple', EmptyReturnCode)
  @authenticate('csTokens')
  async switchCrownstones(
    @inject(SecurityBindings.USER)
    @param.array('switchPairs', "query", {type: 'SwitchPair'}) switchPairs : []
  ) : Promise<void> {
    await CrownstoneHub.uart.switchCrownstones(switchPairs)
  }

}



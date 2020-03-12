import {param, post} from '@loopback/rest';
import {HttpErrors} from '@loopback/rest/dist';
import {EmptyReturnCode} from './returnCodes/ReturnCodes';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {SecurityBindings} from '@loopback/security';


export class SwitchController {


  @post('/switch', EmptyReturnCode)
  @authenticate('csTokens')
  async switchCrownstone(
    @inject(SecurityBindings.USER)
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
    @param.query.number('switchState',   {required:true}) switchState:   number,
  ) : Promise<void> {
    console.log(arguments)

    if (switchState < 0 || switchState > 1) {
      throw new HttpErrors.UnprocessableEntity("Switch state must be between 0 and 1.")
    }
    await Promise.resolve()
  }

  // @post('/switchMultiple', EmptyReturnCode)
  // switchCrownstones(
  //   @param.array('switchPairs', "query", {type: 'SwitchPair'}) switchPairs : []
  // ) : string {
  //   return 'Hello ' + JSON.stringify(switchPairs);
  // }

}



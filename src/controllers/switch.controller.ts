import {getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {HttpErrors} from '@loopback/rest/dist';
import {EmptyReturnCode} from './returnCodes/ReturnCodes';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {SecurityBindings} from '@loopback/security';
import {CrownstoneHub} from '../crownstone/CrownstoneHub';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';


const SwitchDataSchema = {
  oneOf: [
    {
      type: 'object',
      required: ['type', 'crownstoneId'],
      properties: {
        type: {type: 'TURN_ON'},
        crownstoneId: { type: 'number' },
        value: {type:'null'}
      }
    },
    {
      type: 'object',
      required: ['type', 'crownstoneId'],
      properties: {
        type: {type: 'TURN_OFF'},
        crownstoneId: { type: 'number' },
        value: {type:'null'}
      }
    },
    {
      type: 'object',
      required: ['type', 'crownstoneId', 'value'],
      properties: {
        type: { type: "DIMMING" },
        crownstoneId: { type: 'number' },
        value: { type:'number' }
      }
    }
  ]
};


export class SwitchController {
  constructor() {}

  @post('/turnOn', EmptyReturnCode)
  @authenticate('csTokens')
  async turnOn(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
  ) : Promise<void> {
    await CrownstoneHub.uart.switchCrownstones([{type:"TURN_ON", stoneId: crownstoneUID}])
  }
  @post('/turnOff', EmptyReturnCode)
  @authenticate('csTokens')
  async turnOff(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
  ) : Promise<void> {
    await CrownstoneHub.uart.switchCrownstones([{type:"TURN_OFF", stoneId: crownstoneUID}])
  }

  @post('/switch', EmptyReturnCode)
  @authenticate('csTokens')
  async dim(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
    @param.query.number('switchState',   {required:true}) switchState:   number,
  ) : Promise<void> {
    if (switchState < 0 || switchState > 0 && switchState <= 1 || switchState > 100) {
      throw new HttpErrors.UnprocessableEntity("Switch state must be between 0 and 100.")
    }
    await CrownstoneHub.uart.switchCrownstones([{type:"PERCENTAGE", stoneId: crownstoneUID, percentage: switchState}])
  }


  @post('/switchMultiple', EmptyReturnCode)
  @authenticate('csTokens')
  async switchCrownstones(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @requestBody({
      content: {'application/json': { schema: SwitchDataSchema}},
    })
      switchData: SwitchData[],
  ) : Promise<void> {
    await CrownstoneHub.uart.switchCrownstones(switchData)
  }

}



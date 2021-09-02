import {param, post, requestBody, SchemaObject} from '@loopback/rest';
import {HttpErrors} from '@loopback/rest/dist';
import {EmptyReturnCode} from './returnCodes/ReturnCodes';
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {SecurityBindings} from '@loopback/security';
import {CrownstoneHub} from '../crownstone/CrownstoneHub';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';
import {SecurityTypes} from '../constants/Constants';


const SwitchDataSchema : SchemaObject = {
  oneOf: [
    {
      type: 'object',
      required: ['type', 'crownstoneUID'],
      properties: {
        type: {type: 'string', example:"TURN_ON"},
        crownstoneUID: { type: 'number' },
      }
    },
    {
      type: 'object',
      required: ['type', 'crownstoneUID'],
      properties: {
        type: {type: 'string', example:"TURN_OFF"},
        crownstoneUID: { type: 'number' },
      }
    },
    {
      type: 'object',
      required: ['type', 'crownstoneUID', 'percentage'],
      properties: {
        type: { type: "string", example:"PERCENTAGE"},
        crownstoneUID: { type: 'number' },
        percentage: { type:'number' }
      }
    }
  ]
};


export class SwitchController {
  constructor() {}

  @post('/turnOn', EmptyReturnCode)
  @authenticate(SecurityTypes.sphere)
  async turnOn(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
  ) : Promise<void> {
    await CrownstoneHub.uart.switchCrownstones([{type:"TURN_ON", stoneId: crownstoneUID}])
  }
  @post('/turnOff', EmptyReturnCode)
  @authenticate(SecurityTypes.sphere)
  async turnOff(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
  ) : Promise<void> {
    await CrownstoneHub.uart.switchCrownstones([{type:"TURN_OFF", stoneId: crownstoneUID}])
  }

  @post('/switch', EmptyReturnCode)
  @authenticate(SecurityTypes.sphere)
  async dim(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.number('crownstoneUID', {required:true}) crownstoneUID: number,
    @param.query.number('percentage',   {required:true}) percentage:   number,
  ) : Promise<void> {
    if (percentage < 0 || percentage > 100 || (percentage > 0 && percentage < 10)) {
      throw new HttpErrors.UnprocessableEntity("Switch state must be 0 or between 10 and 100.")
    }
    await CrownstoneHub.uart.switchCrownstones([{type:"PERCENTAGE", stoneId: crownstoneUID, percentage: percentage}])
  }


  @post('/switchMultiple', EmptyReturnCode)
  @authenticate(SecurityTypes.sphere)
  async switchCrownstones(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @requestBody({
      content: {'application/json': { schema: SwitchDataSchema}},
    })
      switchData: SwitchData[],
  ) : Promise<void> {
    if (switchData && Array.isArray(switchData)) {
      for (let i = 0; i < switchData.length; i++) {
        let switchElement = switchData[i];
        if ('percentage' in switchElement) {
          let percentage = switchElement.percentage;
          if (percentage < 0 || percentage > 100 || (percentage > 0 && percentage < 10)) {
            throw new HttpErrors.UnprocessableEntity("Switch state must be 0 or between 10 and 100.")
          }
        }
      }
    }

    await CrownstoneHub.uart.switchCrownstones(switchData)
  }

}



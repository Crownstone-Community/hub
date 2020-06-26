
import { Entity, model, property, } from '@loopback/repository';

@model()
export class Hub extends Entity {
  constructor(data?: Partial<Hub>) {
    super(data);
  }

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string'})
  name: string;



  @property({type: 'string', required: true})
  token: string;

  @property({type: 'string'})
  uartKey: string;



  @property({type: 'string'})
  accessToken: string;

  @property({type: 'date'})
  accessTokenExpiration: Date;



  @property({type: 'string', required: true})
  cloudId: string;

  @property({type: 'string', required: true})
  sphereId: string;
}

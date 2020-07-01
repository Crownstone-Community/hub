
import {Entity, model, property, hasMany,} from '@loopback/repository';

@model()
export class PowerData extends Entity {
  constructor(data?: Partial<PowerData>) {
    super(data);
  }

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number', required: true})
  stoneUID: number;

  @property({type: 'number'})
  powerUsage: number;

  @property({type: 'number'})
  powerFactor: number;

  @property({type: 'date'})
  timestamp: Date
}

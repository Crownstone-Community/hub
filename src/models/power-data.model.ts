
import {Entity, model, property, hasMany,} from '@loopback/repository';

@model()
export class PowerData extends Entity {
  constructor(data?: Partial<PowerData>) {
    super(data);
  }

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  stoneUID: string;

  @property({type: 'number'})
  energyUsage: number;

  @property({type: 'date'})
  timestamp: Date
}

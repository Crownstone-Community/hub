import { Entity, model, property } from '@loopback/repository';

@model()
export class SwitchData extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number', required: true})
  stoneUID: number;

  @property({type: 'number'})
  percentage: number;

  @property({type: 'date'})
  timestamp: Date
}

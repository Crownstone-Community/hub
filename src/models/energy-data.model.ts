import { Entity, model, property } from '@loopback/repository';

@model()
export class EnergyData extends Entity {
  constructor(data?: Partial<EnergyData>) {
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

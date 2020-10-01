import { Entity, model, property } from '@loopback/repository';

@model()
export class EnergyData extends Entity {
  constructor(data?: Partial<EnergyData>) {
    super(data);
  }

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number', required: true, index: true})
  stoneUID: number;

  @property({type: 'number'})
  energyUsage: number;

  @property({type: 'number'})
  correctedEnergyUsage: number;

  @property({type: 'number'})
  pointPowerUsage: number;

  @property({type: 'date', index: true})
  timestamp: Date

  @property({ type:'boolean', index: true })
  processed: boolean
}

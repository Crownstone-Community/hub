import { Entity, model, property } from '@loopback/repository';

@model()
export class EnergyDataProcessed extends Entity {
  constructor(data?: Partial<EnergyDataProcessed>) {
    super(data);
  }

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'number', required: true, index: true})
  stoneUID: number;

  @property({type: 'number'})
  energyUsage: number;

  @property({type: 'date', index: true})
  timestamp: Date

  @property({ type:'boolean', index: true })
  uploaded: boolean

  @property({ type:'string', index: true, default: '1m' })
  interval: string
}

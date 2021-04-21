import { Entity, model, property } from '@loopback/repository';

@model()
export class InputAdData extends Entity {

  @property({required: true})
  type: filter_adDataType;

  @property({type: 'number', required: true})
  adType: number;

  @property({type: 'string', required: true})
  mask: number;
}

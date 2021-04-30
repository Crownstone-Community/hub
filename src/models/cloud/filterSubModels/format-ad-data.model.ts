import { Entity, model, property } from '@loopback/repository';

@model()
export class FormatAdData extends Entity {

  @property({required: true})
  type: filterFormat_adDataType_t;

  @property({type: 'number', required: true})
  adType: number;
}

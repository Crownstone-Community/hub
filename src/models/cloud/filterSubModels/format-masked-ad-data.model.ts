import { Entity, model, property } from '@loopback/repository';

@model()
export class FormatMaskedAdData extends Entity {

  @property({required: true})
  type: filterFormat_maskedAdDataType_t;

  @property({type: 'number', required: true})
  adType: number;

  @property({type: 'number', required: true})
  mask: number;
}

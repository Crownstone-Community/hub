import { Entity, model, property } from '@loopback/repository';

@model()
export class FormatFullAdData extends Entity {

  @property({required: true})
  type: filterFormat_fullAdDataType_t;

  @property({type: 'number', required: true})
  adType: number;
}

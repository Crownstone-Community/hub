import { Entity, model, property } from '@loopback/repository';

@model()
export class FormatMacAddress extends Entity {

  @property({required: true})
  type: filterFormat_macAddressType_t;

}

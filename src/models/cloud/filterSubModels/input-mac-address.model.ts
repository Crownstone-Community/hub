import { Entity, model, property } from '@loopback/repository';

@model()
export class InputMacAddress extends Entity {

  @property({required: true})
  type: filter_macAddressType;

}

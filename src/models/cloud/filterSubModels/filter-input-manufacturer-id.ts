import { Entity, model, property } from '@loopback/repository';

@model()
export class FilterInputManufacturerId extends Entity {

  @property({required: true})
  type: filterFormat_manufacturerId_t;
}

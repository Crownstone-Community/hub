import { Entity, model, property } from '@loopback/repository';

@model()
export class OutputDescription_no_output extends Entity {

  @property({required: true})
  type: filterFormat_noOutput_t;

}

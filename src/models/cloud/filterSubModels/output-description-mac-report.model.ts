import { Entity, model, property } from '@loopback/repository';

@model()
export class OutputDescription_mac_report extends Entity {

  @property({required: true})
  type: filterFormat_macAddress_report_t;

}

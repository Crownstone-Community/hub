import { Entity, model, property } from '@loopback/repository';

@model()
export class OutputDescriptionReport extends Entity {

  @property({required: true})
  type: filter_outputReportType;

  @property({required: true})
  representation: filter_outputReportDataType
}

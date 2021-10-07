import { Entity, model, property } from '@loopback/repository';
import {filterFormat} from '../asset.model';

@model()
export class OutputDescription_assetId_report extends Entity {

  @property({required: true})
  type: filterFormat_assetId_report_t;

  @property({required: true})
  inputData: filterFormat

}

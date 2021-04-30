import { Entity, model, property } from '@loopback/repository';
import {filterFormat} from '../asset.model';

@model()
export class OutputDescription_shortId_track extends Entity {

  @property({required: true})
  type: filterFormat_shortAssetId_track_t;

  @property({required: true})
  inputData: filterFormat

}

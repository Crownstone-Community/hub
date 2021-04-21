import { Entity, model, property } from '@loopback/repository';

@model()
export class OutputDescriptionTrackMacAddress extends Entity {

  @property({required: true})
  type: filter_outputTrackType;

  @property({required: true})
  representation: filter_outputTrackRepresentationAdType

  @property({type: 'number', required: true})
  adType: number;

  @property({type: 'string', required: true})
  mask: number;
}

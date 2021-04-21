import { Entity, model, property } from '@loopback/repository';

@model()
export class OutputDescriptionTrackAdData extends Entity {

  @property({required: true})
  type: filter_outputTrackType;

  @property({required: true})
  representation: filter_outputTrackRepresentationMacAddressType


}

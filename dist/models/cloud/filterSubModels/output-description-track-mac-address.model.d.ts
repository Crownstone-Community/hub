import { Entity } from '@loopback/repository';
export declare class OutputDescriptionTrackMacAddress extends Entity {
    type: filter_outputTrackType;
    representation: filter_outputTrackRepresentationAdType;
    adType: number;
    mask: number;
}

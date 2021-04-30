import { Entity } from '@loopback/repository';
export declare class OutputDescriptionTrackAdData extends Entity {
    type: filter_outputTrackType;
    representation: filter_outputTrackRepresentationAdType;
    adType: number;
    mask: number;
}

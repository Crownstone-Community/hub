import { Entity } from '@loopback/repository';
export declare class FormatMaskedAdData extends Entity {
    type: filterFormat_maskedAdDataType_t;
    adType: number;
    mask: number;
}

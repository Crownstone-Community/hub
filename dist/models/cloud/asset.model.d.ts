import { BaseEntity } from '../bases/base-entity';
import { FormatMaskedAdData } from './filterSubModels/format-masked-ad-data.model';
import { FormatFullAdData } from './filterSubModels/format-full-ad-data.model';
import { FormatMacAddress } from './filterSubModels/format-mac-address.model';
import { FilterInputManufacturerId } from './filterSubModels/filter-input-manufacturer-id';
import { OutputDescription_mac_report } from './filterSubModels/output-description-mac-report.model';
import { OutputDescription_assetId_report } from './filterSubModels/output-description-assetId-report.model';
import { OutputDescription_no_output } from './filterSubModels/output-description-no-output.model';
export declare type filterFormat = FormatMacAddress | FormatFullAdData | FormatMaskedAdData | FilterInputManufacturerId;
export declare type filterOutputDescription = OutputDescription_assetId_report | OutputDescription_mac_report | OutputDescription_no_output;
declare const Asset_base: {
    new (...args: any[]): {
        updatedAt: Date;
        createdAt: Date;
        toJSON: () => Object;
        toObject: (options?: import("@loopback/repository").AnyObject | undefined) => Object;
    };
} & typeof BaseEntity;
export declare class Asset extends Asset_base {
    id: string;
    name: string;
    description: string;
    type: string;
    cloudId: string;
    committed: boolean;
    markedForDeletion: boolean;
    profileId: number;
    exclude: boolean;
    desiredFilterType: filterType_t;
    inputData: filterFormat;
    outputDescription: filterOutputDescription;
    data: string;
    filterId: string;
}
export {};

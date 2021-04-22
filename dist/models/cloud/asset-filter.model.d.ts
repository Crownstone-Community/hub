import { BaseEntity } from '../bases/base-entity';
import { InputMacAddress } from './filterSubModels/input-mac-address.model';
import { InputAdData } from './filterSubModels/input-ad-data.model';
import { OutputDescriptionReport } from './filterSubModels/output-description-report.model';
import { OutputDescriptionTrackMacAddress } from './filterSubModels/output-description-track-mac-address.model';
import { OutputDescriptionTrackAdData } from './filterSubModels/output-description-track-ad-data.model';
import { Asset } from './asset.model';
declare const AssetFilter_base: {
    new (...args: any[]): {
        updatedAt: Date;
        createdAt: Date;
        toJSON: () => Object;
        toObject: (options?: import("@loopback/repository").AnyObject | undefined) => Object;
    };
} & typeof BaseEntity;
export declare class AssetFilter extends AssetFilter_base {
    id: string;
    cloudId: string;
    filterVersion: number;
    filterId: number;
    filterCRC: string;
    inputData: InputMacAddress | InputAdData;
    outputDescription: OutputDescriptionReport | OutputDescriptionTrackMacAddress | OutputDescriptionTrackAdData;
    assets: Asset[];
    filterSetId: string;
}
export {};

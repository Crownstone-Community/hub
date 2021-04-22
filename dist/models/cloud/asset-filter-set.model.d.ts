import { BaseEntity } from '../bases/base-entity';
import { AssetFilter } from './asset-filter.model';
declare const AssetFilterSet_base: {
    new (...args: any[]): {
        updatedAt: Date;
        createdAt: Date;
        toJSON: () => Object;
        toObject: (options?: import("@loopback/repository").AnyObject | undefined) => Object;
    };
} & typeof BaseEntity;
export declare class AssetFilterSet extends AssetFilterSet_base {
    id: string;
    cloudId: string;
    masterVersion: number;
    filters: AssetFilter[];
}
export {};

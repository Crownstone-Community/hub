import { BaseEntity } from '../../bases/base-entity';
declare const AssetPresence_base: {
    new (...args: any[]): {
        updatedAt: Date;
        createdAt: Date;
        toJSON: () => Object;
        toObject: (options?: import("@loopback/repository").AnyObject | undefined) => Object;
    };
} & typeof BaseEntity;
export declare class AssetPresence extends AssetPresence_base {
    id: string;
    inSphere: boolean;
    assetId: string;
}
export {};

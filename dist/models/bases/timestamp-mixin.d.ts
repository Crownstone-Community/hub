import { Model } from '@loopback/repository';
import { MixinTarget } from "@loopback/core";
export declare function AddTimestamps<T extends MixinTarget<Model>>(superClass: T): {
    new (...args: any[]): {
        updatedAt: Date;
        createdAt: Date;
        toJSON: () => Object;
        toObject: (options?: import("@loopback/repository").AnyObject | undefined) => Object;
    };
} & T;

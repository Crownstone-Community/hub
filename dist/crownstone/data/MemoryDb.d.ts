interface Crownstone {
    name: string;
    uid: number;
    macAddress: string;
    switchState: number | null;
    locked: boolean;
    dimming: boolean;
    switchcraft: boolean;
    tapToToggle: boolean;
    cloudId: string;
    locationCloudId: string;
    updatedAt: number;
}
interface Location {
    name: string;
    uid: number;
    icon: string;
    cloudId: string;
    updatedAt: number;
}
declare class MemoryDbClass {
    stones: {
        [shortUid: string]: Crownstone;
    };
    locations: {
        [shortUid: string]: Location;
    };
    locationByCloudId: {
        [cloudId: string]: Location;
    };
    loadCloudLocationData(locationData: cloud_Location[]): void;
    loadCloudStoneData(stoneData: cloud_Stone[]): void;
}
export declare function fillWithStoneData(uid: number | string): {
    uid: number;
    name: string | null;
    cloudId: string | null;
    locationName: string | null;
};
export declare function getStoneIdFromMacAdddress(macAddress: string): string | null;
export declare const MemoryDb: MemoryDbClass;
export {};

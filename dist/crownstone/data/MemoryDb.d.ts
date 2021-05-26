declare class MemoryDbClass {
    stones: {
        [shortUid: string]: Crownstone;
    };
    locations: {
        [shortUid: string]: Location_t;
    };
    locationByCloudId: {
        [cloudId: string]: Location_t;
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

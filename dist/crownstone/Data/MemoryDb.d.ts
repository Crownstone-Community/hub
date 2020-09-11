interface Crownstone {
    name: string;
    uid: number;
    switchState: number | null;
    locked: boolean;
    dimming: boolean;
    switchcraft: boolean;
    tapToToggle: boolean;
    cloudId: string;
    updatedAt: number;
}
declare class MemoryDbClass {
    stones: {
        [key: string]: Crownstone;
    };
    loadCloudStoneData(stoneData: cloud_Stone[]): void;
}
export declare const MemoryDb: MemoryDbClass;
export {};

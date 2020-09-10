export declare class TopologyMonitor {
    crownstonesInMesh: {
        [stoneUid: number]: boolean;
    };
    collect(crownstoneId: number): void;
}

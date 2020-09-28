export declare class TopologyMonitor {
    crownstonesInMesh: {
        [stoneUID: string]: number;
    };
    collect(crownstoneId: number): void;
}

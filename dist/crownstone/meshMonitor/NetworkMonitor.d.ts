export declare class NetworkMonitor {
    crownstonesInMesh: {
        [stoneUID: string]: number;
    };
    lossStatistics: {
        [stoneUID: string]: LossStatistics;
    };
    topology: {
        [lookupId: string]: Edge;
    };
    updateLastSeen(crownstoneId: number): void;
    updateTopology(data: TopologyUpdateData): void;
    resetTopology(): void;
    _getLookupId(data: TopologyUpdateData): string;
}

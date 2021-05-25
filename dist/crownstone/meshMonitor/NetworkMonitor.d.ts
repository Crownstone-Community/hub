export declare class NetworkMonitor {
    crownstonesInMesh: {
        [stoneUID: string]: number;
    };
    topology: {
        [lookupId: string]: Edge;
    };
    updateLastSeen(crownstoneId: number): void;
    updateTopology(data: TopologyUpdateData): void;
    resetTopology(): void;
    _getLookupId(data: TopologyUpdateData): string;
}

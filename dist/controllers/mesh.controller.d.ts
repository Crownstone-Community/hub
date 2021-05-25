interface CrownstoneInMeshData {
    uid: number;
    name: string | null;
    cloudId: string | null;
    locationName: string | null;
    lastSeen: Date;
    lastSeenSwitchState: number | null;
}
export declare class MeshController {
    constructor();
    getCrownstonesInMesh(): Promise<CrownstoneInMeshData[]>;
    getTopology(): Promise<Edge[]>;
    refreshTopology(): Promise<void>;
}
export {};

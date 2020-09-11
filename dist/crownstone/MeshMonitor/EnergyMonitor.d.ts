/// <reference types="node" />
import Timeout = NodeJS.Timeout;
export declare class EnergyMonitor {
    timeInterval: Timeout | null;
    hubReference: CrownstoneHub;
    constructor(hub: CrownstoneHub);
    init(): void;
    stop(): void;
    checkForUpload(): Promise<void>;
    collect(crownstoneId: number, accumulatedEnergy: number): void;
}

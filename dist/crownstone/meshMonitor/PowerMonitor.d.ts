/// <reference types="node" />
import Timeout = NodeJS.Timeout;
export declare class PowerMonitor {
    storeInterval: Timeout;
    constructor();
    init(): void;
    stop(): void;
    collect(crownstoneId: number, powerUsageReal: number, powerFactor: number, timestamp: number): Promise<import("../../models").PowerData>;
}

/// <reference types="node" />
import { InMemoryCache } from '../Data/InMemoryCache';
import Timeout = NodeJS.Timeout;
export declare class PowerMonitor {
    storeInterval: Timeout;
    powerCache: InMemoryCache;
    constructor();
    init(): void;
    stop(): void;
    collect(crownstoneId: number, powerUsageReal: number, powerFactor: number, timestamp: number): Promise<import("../../models").PowerData>;
}

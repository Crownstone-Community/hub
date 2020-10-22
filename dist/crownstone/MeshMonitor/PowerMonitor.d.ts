export declare class PowerMonitor {
    collect(crownstoneId: number, powerUsageReal: number, powerFactor: number, timestamp: number): Promise<import("../../models").PowerData>;
}

/// <reference types="node" />
import Timeout = NodeJS.Timeout;
export declare class Timekeeper {
    timeInterval: Timeout | null;
    hubReference: CrownstoneHub;
    constructor(hub: CrownstoneHub);
    init(): void;
    setTime(): Promise<void>;
    stop(): void;
}

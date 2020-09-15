/// <reference types="node" />
import Timeout = NodeJS.Timeout;
export declare class Timekeeper {
    timeInterval: Timeout | null;
    hubReference: CrownstoneHub;
    constructor(hub: CrownstoneHub);
    init(): void;
    action(): void;
    stop(): void;
}

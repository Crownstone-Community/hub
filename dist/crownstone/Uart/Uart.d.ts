import { CrownstoneUart } from 'crownstone-uart';
import { PromiseManager } from './PromiseManager';
export declare class Uart {
    uart: CrownstoneUart;
    queue: PromiseManager;
    ready: boolean;
    constructor();
    forwardEvents(): void;
    initialize(): Promise<void>;
    switchCrownstones(switchPairs: SwitchData[]): Promise<any>;
    registerTrackedDevice(trackingNumber: number, locationUID: number, profileId: number, rssiOffset: number, ignoreForPresence: boolean, tapToToggleEnabled: boolean, deviceToken: number, ttlMinutes: number): void;
}

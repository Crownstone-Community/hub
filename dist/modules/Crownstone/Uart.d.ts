import { CrownstoneUart } from 'crownstone-uart';
import { PromiseManager } from './PromiseManager';
import { EventBusClass } from '../EventBus';
interface SwitchPair {
    crownstoneId: number;
    switchState: number;
}
export declare class Uart {
    uart: CrownstoneUart;
    queue: PromiseManager;
    internalEventBus: EventBusClass;
    ready: boolean;
    constructor(internalEventBus: EventBusClass);
    forwardEvents(): void;
    initialize(): Promise<void>;
    switchCrownstones(switchPairs: SwitchPair[]): void;
    registerTrackedDevice(trackingNumber: number, locationUID: number, profileId: number, rssiOffset: number, ignoreForPresence: boolean, tapToToggleEnabled: boolean, deviceToken: number, ttlMinutes: number): void;
}
export {};

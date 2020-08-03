import { CrownstoneUart } from 'crownstone-uart';
import { PromiseManager } from './PromiseManager';
import { EventBusClass } from '../EventBus';
import { CrownstoneSSE } from 'crownstone-sse/dist';
interface SwitchPair {
    crownstoneId: number;
    switchState: number;
}
export declare class Bridge {
    uart: CrownstoneUart;
    sse: CrownstoneSSE;
    queue: PromiseManager;
    eventBus: EventBusClass;
    ready: boolean;
    constructor(eventBus: EventBusClass);
    forwardEvents(): void;
    login(token: string): Promise<void>;
    _sseEventHandler(data: SseEvent): void;
    initialize(): Promise<void>;
    switchCrownstones(switchPairs: SwitchPair[]): void;
    registerTrackedDevice(trackingNumber: number, locationUID: number, profileId: number, rssiOffset: number, ignoreForPresence: boolean, tapToToggleEnabled: boolean, deviceToken: number, ttlMinutes: number): void;
}
export {};

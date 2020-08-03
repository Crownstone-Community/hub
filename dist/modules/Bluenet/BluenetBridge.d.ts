import { ModuleBase } from '../ModuleBaseClass';
import { BluenetUart } from 'bluenet-nodejs-lib-uart';
import { PromiseManager } from './PromiseManager';
import { EventBusClass } from '../EventBus';
interface SwitchPair {
    crownstoneId: number;
    switchState: number;
}
export declare class BluenetBridge extends ModuleBase {
    bluenet: BluenetUart;
    queue: PromiseManager;
    ready: boolean;
    constructor(eventBus: EventBusClass);
    forwardEvents(): void;
    initialize(): Promise<void>;
    switchCrownstones(switchPairs: SwitchPair[]): void;
    registerTrackedDevice(trackingNumber: number, locationUID: number, profileId: number, rssiOffset: number, ignoreForPresence: boolean, tapToToggleEnabled: boolean, deviceToken: number, ttlMinutes: number): void;
}
export {};

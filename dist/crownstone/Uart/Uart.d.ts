import { CrownstoneUart } from 'crownstone-uart';
import { PromiseManager } from './PromiseManager';
import { UartHubDataCommunication } from './UartHubDataCommunication';
import { CrownstoneCloud } from 'crownstone-cloud';
export declare class Uart implements UartInterface {
    connection: CrownstoneUart;
    queue: PromiseManager;
    hubDataHandler: UartHubDataCommunication;
    ready: boolean;
    cloud: CrownstoneCloud;
    initializing: false;
    constructor(cloud: CrownstoneCloud);
    forwardEvents(): void;
    initialize(): Promise<void>;
    refreshUartEncryption(): Promise<void>;
    switchCrownstones(switchPairs: SwitchData[]): Promise<any>;
    registerTrackedDevice(trackingNumber: number, locationUID: number, profileId: number, rssiOffset: number, ignoreForPresence: boolean, tapToToggleEnabled: boolean, deviceToken: number, ttlMinutes: number): void;
}

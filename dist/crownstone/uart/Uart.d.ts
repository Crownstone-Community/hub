/// <reference types="node" />
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
    keyWasSet: boolean;
    refreshingKey: boolean;
    timeLastRefreshed: number;
    _initialized: Promise<void>;
    constructor(cloud: CrownstoneCloud);
    forwardEvents(): void;
    _initialize(): Promise<void>;
    /**
     * This will directly return a promise, which will be resolved once uart is initialized.
     */
    initialize(): Promise<void>;
    refreshUartEncryption(): Promise<void>;
    setUartKey(key: string | Buffer): void;
    refreshMeshTopology(): Promise<any>;
    switchCrownstones(switchPairs: SwitchData[]): Promise<any>;
    registerTrackedDevice(trackingNumber: number, locationUID: number, profileId: number, rssiOffset: number, ignoreForPresence: boolean, tapToToggleEnabled: boolean, deviceToken: number, ttlMinutes: number): void;
    syncFilters(allowErrorRepair?: boolean): Promise<void>;
}

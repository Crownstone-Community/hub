/// <reference types="node" />
import { CrownstoneSSE } from 'crownstone-sse/dist';
import { CrownstoneCloud } from 'crownstone-cloud';
import { Hub } from '../../models/hub.model';
import { SseEventHandler } from './SseEventHandler';
import Timeout = NodeJS.Timeout;
export declare class CloudManager {
    cloud: CrownstoneCloud;
    sse: CrownstoneSSE | null;
    sseEventHandler: SseEventHandler;
    initializeInProgress: boolean;
    loginInProgress: boolean;
    syncInProgress: boolean;
    sseSetupInprogress: boolean;
    ipUpdateInprogress: boolean;
    sphereId: string;
    eventsRegistered: boolean;
    resetTriggered: boolean;
    storedIpAddress: string | null;
    intervalsRegistered: boolean;
    interval_sync: Timeout | null;
    interval_ip: Timeout | null;
    constructor();
    setupEvents(): void;
    cleanup(): Promise<void>;
    initialize(): Promise<void>;
    login(hub: Hub): Promise<void>;
    sync(): Promise<void>;
    setupSSE(hub: Hub): Promise<void>;
    updateLocalIp(): Promise<void>;
}

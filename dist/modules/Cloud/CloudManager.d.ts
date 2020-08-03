import { CrownstoneSSE } from 'crownstone-sse/dist';
import { CrownstoneCloud } from 'crownstone-cloud';
import { Hub } from '../../models/hub.model';
import { SseEventHandler } from './SseEventHandler';
export declare class CloudManager {
    cloud: CrownstoneCloud;
    sse: CrownstoneSSE | null;
    sseEventHandler: SseEventHandler;
    initializeInProgress: boolean;
    loginInProgress: boolean;
    syncInProgress: boolean;
    sseSetupInprogress: boolean;
    sphereId: string;
    eventsRegistered: boolean;
    constructor();
    setupEvents(): void;
    initialize(): Promise<void>;
    login(hub: Hub): Promise<void>;
    sync(): Promise<void>;
    setupSSE(hub: Hub): Promise<void>;
}

/// <reference types="node" />
import { Uart } from './Uart/Uart';
import { CloudManager } from './Cloud/CloudManager';
import { MeshMonitor } from './MeshMonitor/MeshMonitor';
import { Timekeeper } from './Actions/Timekeeper';
import Timeout = NodeJS.Timeout;
import { WebhookManager } from './Webhooks/WebhookManager';
export declare class CrownstoneHubClass implements CrownstoneHub {
    uart: Uart;
    cloud: CloudManager;
    mesh: MeshMonitor;
    timeKeeper: Timekeeper;
    webhooks: WebhookManager;
    linkedStoneCheckInterval: Timeout;
    setStatusBackupInterval: Timeout;
    constructor();
    initialize(): Promise<void>;
    cleanupAndDestroy(partial?: boolean): Promise<void>;
}
export declare const CrownstoneHub: CrownstoneHubClass;

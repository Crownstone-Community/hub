/// <reference types="node" />
import { Uart } from './uart/Uart';
import { CloudManager } from './cloud/CloudManager';
import { MeshMonitor } from './meshMonitor/MeshMonitor';
import { Timekeeper } from './actions/Timekeeper';
import Timeout = NodeJS.Timeout;
import { WebhookManager } from './webhooks/WebhookManager';
import { FilterManager } from './filters/FilterManager';
export declare class CrownstoneHubClass implements CrownstoneHub {
    uart: Uart;
    cloud: CloudManager;
    mesh: MeshMonitor;
    timeKeeper: Timekeeper;
    webhooks: WebhookManager;
    filters: FilterManager;
    linkedStoneCheckInterval: Timeout;
    setStatusBackupInterval: Timeout;
    constructor();
    initialize(): Promise<void>;
    cleanupAndDestroy(partial?: boolean): Promise<void>;
}
export declare const CrownstoneHub: CrownstoneHubClass;

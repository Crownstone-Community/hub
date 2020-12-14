/// <reference types="node" />
import { Uart } from './Uart/Uart';
import { CloudManager } from './Cloud/CloudManager';
import { MeshMonitor } from './MeshMonitor/MeshMonitor';
import { Timekeeper } from './Actions/Timekeeper';
import Timeout = NodeJS.Timeout;
export declare class CrownstoneHubClass implements CrownstoneHub {
    uart: Uart;
    cloud: CloudManager;
    mesh: MeshMonitor;
    timeKeeper: Timekeeper;
    linkedStoneCheckInterval: Timeout;
    constructor();
    initialize(): Promise<void>;
    cleanupAndDestroy(partial?: boolean): Promise<void>;
}
export declare const CrownstoneHub: CrownstoneHubClass;

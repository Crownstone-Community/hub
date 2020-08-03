import { Uart } from './Uart/Uart';
import { CloudManager } from './Cloud/CloudManager';
import { MeshMonitor } from './MeshMonitor/MeshMonitor';
declare class CrownstoneHubClass {
    uart: Uart;
    cloud: CloudManager;
    mesh: MeshMonitor;
    launched: boolean;
    constructor();
    initialize(): Promise<void>;
    cleanupAndDestroy(): Promise<void>;
}
export declare const CrownstoneHub: CrownstoneHubClass;
export {};

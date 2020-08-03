import { Uart } from './Uart/Uart';
import { CloudManager } from './Cloud/CloudManager';
declare class CrownstoneHubClass {
    uart: Uart;
    cloud: CloudManager;
    launched: boolean;
    constructor();
    initialize(): Promise<void>;
}
export declare const CrownstoneHub: CrownstoneHubClass;
export {};

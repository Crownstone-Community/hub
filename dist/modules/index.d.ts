import { EventBusClass } from './EventBus';
import { MeshMonitor } from './MeshMonitor/MeshMonitor';
import { Bridge } from './Crownstone/Bridge';
interface Modules {
    uart: Bridge;
    meshMonitor: MeshMonitor;
    eventBus: EventBusClass;
}
export declare let Modules: Modules;
export declare function LaunchModules(): Promise<void>;
export {};

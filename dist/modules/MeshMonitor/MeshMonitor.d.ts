import { ModuleBase } from '../ModuleBaseClass';
export declare class MeshMonitor extends ModuleBase {
    topology: {
        nodes: never[];
        edges: never[];
    };
    initialize(): Promise<void>;
    _handleServiceData(serviceData: ServiceDataJson): void;
}

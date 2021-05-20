import { CloudManager } from './CloudManager';
declare type CloudPromiseCallback = (cloud: CloudManager) => Promise<void>;
declare class CloudCommandHandlerClass {
    manager: CloudManager;
    queue: CloudPromiseCallback[];
    iterating: boolean;
    constructor();
    iterate(): Promise<void>;
    iterateStep(): Promise<void>;
    loadManager(manager: CloudManager): void;
    addToQueue(cloudCall: CloudPromiseCallback): void;
}
export declare const CloudCommandHandler: CloudCommandHandlerClass;
export {};

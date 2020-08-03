import { EventBusClass } from './EventBus';
export declare class ModuleBase {
    eventBus: EventBusClass;
    constructor(eventBus: EventBusClass);
    initialize(): Promise<void>;
}

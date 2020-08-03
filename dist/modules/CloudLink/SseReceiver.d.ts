import { ModuleBase } from '../ModuleBaseClass';
export declare class SseReceiver extends ModuleBase {
    eventSource: EventSource | null;
    token: string;
    ready: boolean;
    initialize(): Promise<void>;
    loadToken(token: string): void;
    startEventFeed(): void;
}

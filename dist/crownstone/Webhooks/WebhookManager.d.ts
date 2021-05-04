import { Webhook } from '../../models/hub-specific/webhook.model';
declare type fn = () => void;
export declare class WebhookManager {
    initialized: boolean;
    hooksByEvent: {
        [eventTopic: string]: Webhook[];
    };
    subscriptions: fn[];
    init(): void;
    cleanup(): void;
    refreshHooks(): Promise<void>;
    mapData(incomingTopic: string, data: any): {
        topic: string;
        data: any;
    } | null;
    evaluateHooks(incomingTopic: string, data: any): void;
    invoke(hook: Webhook, data: any): Promise<void>;
}
export {};

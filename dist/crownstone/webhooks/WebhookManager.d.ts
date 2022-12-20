import { Webhook } from '../../models/hub-specific/webhook.model';
import { WebhookCollector, webhookDataType } from './WebhookCollector';
export declare class WebhookManager {
    hookIntervals: () => {};
    collectors: WebhookCollector[];
    init(): void;
    cleanup(): void;
    refreshHooks(): Promise<void>;
    invoke(hook: Webhook, data: webhookDataType[]): Promise<void>;
    formatData(hook: Webhook, items: webhookDataType[]): ({
        cid: number;
        cm: string | null;
        am: string;
        r: number;
        c: number;
        t: number;
    } | {
        crownstoneId: number;
        crownstoneMacAddress: string | null;
        assetMacAddress: string;
        assetRssi: number;
        rssiChannel: number;
        timestamp: number;
    })[];
}

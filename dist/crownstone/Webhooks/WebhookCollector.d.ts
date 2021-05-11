/// <reference types="node" />
import { Webhook } from '../../models/hub-specific/webhook.model';
import { AssetReportWebhookData } from './data/AssetReportWebhookData';
declare type fn = () => void;
export declare type webhookDataType = AssetReportWebhookData;
declare type invocator = (data: webhookDataType[]) => Promise<void>;
export declare class WebhookCollector {
    collectedData: AssetReportWebhookData[];
    subscriptions: fn[];
    _hook: Webhook;
    _interval: NodeJS.Timeout;
    _batched: boolean;
    _invocationCallback: invocator;
    constructor(hook: Webhook, invocationCallback: invocator);
    _setListeners(): void;
    load(topic: string, data: AssetMacReportData): void;
    _getData(): AssetReportWebhookData[];
    wrapUp(): Promise<void>;
    _removeListeners(): void;
    cleanup(): void;
}
export {};

import { Entity } from '@loopback/repository';
export declare class Webhook extends Entity {
    id: string;
    event: WebhookEvents;
    clientSecret: string;
    endPoint: string;
    compressed: boolean;
    batchTimeSeconds: number;
    customHandler: string;
    customHandlerIssue: string;
    apiKey: string;
    apiKeyHeader: string;
}

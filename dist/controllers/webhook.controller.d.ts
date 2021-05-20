import { DataObject } from '@loopback/repository';
import { UserProfileDescription } from '../security/authentication-strategies/csToken-strategy';
import { Webhook } from '../models/hub-specific/webhook.model';
import { WebhookRepository } from '../repositories/hub-specific/webhook.repository';
/**
 * This controller will echo the state of the hub.
 */
export declare class WebhookController {
    protected webhookRepo: WebhookRepository;
    constructor(webhookRepo: WebhookRepository);
    createWebhook(userProfile: UserProfileDescription, newHook: DataObject<Webhook>): Promise<Webhook>;
    getWebhooks(userProfile: UserProfileDescription): Promise<Webhook[]>;
    deleteWebhook(userProfile: UserProfileDescription, id: string): Promise<Count>;
    deleteAllAssets(userProfile: UserProfileDescription, YesImSure: string): Promise<Count>;
}

import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { Webhook } from '../../models/hub-specific/webhook.model';
export declare class WebhookRepository extends DefaultCrudRepository<Webhook, typeof Webhook.prototype.id> {
    protected datasource: juggler.DataSource;
    constructor(datasource: juggler.DataSource);
}

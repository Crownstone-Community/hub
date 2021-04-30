import { DefaultCrudRepository, juggler } from '@loopback/repository';
import { inject } from '@loopback/core';
import {Webhook} from '../../models/hub-specific/webhook.model';


export class WebhookRepository extends DefaultCrudRepository<Webhook,typeof Webhook.prototype.id> {

  constructor( @inject('datasources.mongo') protected datasource: juggler.DataSource ) {
    super(Webhook, datasource);
  }
}


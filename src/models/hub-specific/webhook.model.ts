import { Entity, model, property, } from '@loopback/repository';

@model()
export class Webhook extends Entity {

  @property({type: 'string', id: true})
  id: string;

  @property({type: 'string', required: true})
  event: WebhookEvents;

  @property({type: 'string', required: true})
  clientSecret: string;

  @property({type: 'string', required: true})
  endPoint: string;

  @property({type: 'boolean', required: true})
  compressed: boolean;

  @property({type: 'number'})
  batchTimeSeconds: number;

  @property({type: 'string'})
  customHandler: string;

  @property({type: 'string'})
  customHandlerIssue: string;

  @property({type: 'string', required: false})
  apiKey: string;

  @property({type: 'string', required: false})
  apiKeyHeader: string;

}

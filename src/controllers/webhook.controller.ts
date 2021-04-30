import {DataObject, repository} from '@loopback/repository';
import {authenticate} from '@loopback/authentication';
import {SecurityTypes} from '../constants/Constants';
import {inject} from '@loopback/core';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';
import {del, get, HttpErrors, param, post, requestBody} from '@loopback/rest';
import {Webhook} from '../models/hub-specific/webhook.model';
import {WebhookRepository} from '../repositories/hub-specific/webhook.repository';

/**
 * This controller will echo the state of the hub.
 */
export class WebhookController {

  constructor(
    @repository(WebhookRepository) protected webhookRepo: WebhookRepository,
  ) {}


  @post('/webhooks')
  @authenticate(SecurityTypes.sphere)
  async createWebhook(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @requestBody({required: true}) newHook: DataObject<Webhook>,
  ): Promise<Webhook> {
    return this.webhookRepo.create(newHook);
  }

  @get('/webhooks')
  @authenticate(SecurityTypes.sphere)
  async getWebhooks(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @requestBody({required: true}) newHook: DataObject<Webhook>,
  ): Promise<Webhook[]> {
    return await this.webhookRepo.find()
  }


  @del('/webhooks/{id}')
  @authenticate(SecurityTypes.sphere)
  async deleteWebhook(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
  ): Promise<Count> {
    if (!id) {
      throw new HttpErrors.BadRequest("Invalid id");
    }
    return this.webhookRepo.deleteAll({id: id})
  }
}

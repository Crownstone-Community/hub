import {DataObject, repository} from '@loopback/repository';
import {authenticate} from '@loopback/authentication';
import {SecurityTypes} from '../constants/Constants';
import {inject} from '@loopback/core';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';
import {del, get, getModelSchemaRef, HttpErrors, param, post, requestBody} from '@loopback/rest';
import {Webhook} from '../models/hub-specific/webhook.model';
import {WebhookRepository} from '../repositories/hub-specific/webhook.repository';
import {CrownstoneHub} from '../crownstone/CrownstoneHub';
import {WebhookTopics} from '../crownstone/topics';

/**
 * This controller will echo the state of the hub.
 */
export class WebhookController {

  constructor(
    @repository(WebhookRepository) protected webhookRepo: WebhookRepository,
  ) {}


  @post('/webhooks')
  @authenticate(SecurityTypes.admin)
  async createWebhook(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(Webhook, {
            title: 'NewWebhook',
            exclude: ['id'],
          }),
        },
      },
      description: "Create a webhook that will invoke an endpoint on certain event triggers."}) newHook: DataObject<Webhook>,
  ): Promise<Webhook> {
    if (!newHook) { throw new HttpErrors.BadRequest("Data required") }

    // @ts-ignore
    if (!WebhookTopics[newHook.event]) {
      throw new HttpErrors.BadRequest("Invalid Event. Possiblities are: " + Object.keys(WebhookTopics).join(", "))
    }

    let hook = await this.webhookRepo.create(newHook);
    await CrownstoneHub.webhooks.refreshHooks();
    return hook;
  }

  @get('/webhooks')
  @authenticate(SecurityTypes.sphere)
  async getWebhooks(@inject(SecurityBindings.USER) userProfile : UserProfileDescription): Promise<Webhook[]> {
    return await this.webhookRepo.find()
  }


  @del('/webhooks/{id}')
  @authenticate(SecurityTypes.admin)
  async deleteWebhook(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
  ): Promise<Count> {
    if (!id) {
      throw new HttpErrors.BadRequest("Invalid id");
    }
    let count = this.webhookRepo.deleteAll({id: id});
    await CrownstoneHub.webhooks.refreshHooks();
    return count;
  }

  @del('/webhooks/all')
  @authenticate(SecurityTypes.admin)
  async deleteAllAssets(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.string('YesImSure', {required:true}) YesImSure: string,
  ): Promise<Count> {
    if (YesImSure !== 'YesImSure') { throw new HttpErrors.BadRequest("YesImSure must be 'YesImSure'"); }

    let count = this.webhookRepo.deleteAll();
    await CrownstoneHub.webhooks.refreshHooks();
    return count;
  }

}

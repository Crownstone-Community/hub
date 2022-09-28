import {DataObject, repository} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from '@loopback/rest';
import {HubRepository} from '../repositories/hub-specific/hub.repository';
import {UserRepository} from '../repositories';
import {HubStatus,} from '../crownstone/HubStatus';
import {BOOT_TIME} from '../application';
import {CrownstoneUtil} from '../crownstone/CrownstoneUtil';
import {eventBus} from '../crownstone/HubEventBus';
import {Hub} from '../models';
import {CrownstoneCloud} from 'crownstone-cloud';
import {topics} from '../crownstone/topics';
import {SecurityTypes} from '../constants/Constants';
import {authenticate} from '@loopback/authentication';

/**
 * This controller will echo the state of the hub.
 */
export class HubController {

  constructor(
    @repository(HubRepository)  protected hubRepo: HubRepository,
    @repository(UserRepository) protected userRepo: UserRepository,
  ) {}


  @post('/hub')
  async createHub(
    @requestBody({
      content: {'application/json': { schema: getModelSchemaRef(Hub, { title: 'newHub', exclude: ['id','uartKey','accessToken','accessTokenExpiration'] })}},
    })
    newHub: DataObject<Hub>,
  ): Promise<void> {
    if (await this.hubRepo.isSet() === false) {
      let cloud = new CrownstoneCloud();
      if (!(newHub.cloudId && newHub.token)) {
        throw new HttpErrors.BadRequest("CloudId and token are mandatory.");
      }
      try {
        await cloud.hubLogin(newHub.cloudId, newHub.token);
      }
      catch (e: any) {
        if (e && e.statusCode === 401) {
          throw new HttpErrors.BadRequest("Invalid token/cloudId combination.");
        }
      }
      return this.hubRepo.create(newHub)
        .then(() => {
          eventBus.emit(topics.HUB_CREATED);
        })
    }
    else {
      throw new HttpErrors.Forbidden("Hub already created and initialized.");
    }
  }

  @del('/hub/')
  @authenticate(SecurityTypes.admin)
  async delete(
    @param.query.string('YesImSure', {required:true}) YesImSure: string,
  ): Promise<string> {
    if (YesImSure !== 'YesImSure') {
      throw new HttpErrors.BadRequest("YesImSure must be 'YesImSure'");
    }
    return await CrownstoneUtil.deleteCrownstoneHub(true);
  }

  @del('/hub/everything')
  @authenticate(SecurityTypes.admin)
  async deleteEverything(
    @param.query.string('YesImSure', {required:true}) YesImSure: string,
  ): Promise<string> {
    if (YesImSure !== 'YesImSure') {
      throw new HttpErrors.BadRequest("YesImSure must be 'YesImSure'");
    }
    return await CrownstoneUtil.deleteCrownstoneHub(false);
  }

  @get('/hubStatus')
  async getHubStatus(): Promise<HubStatus> {
    if (await this.hubRepo.isSet() === false) {
      throw new HttpErrors.NotFound("No hub configured.");
    }
    return {...HubStatus, uptime: Math.round((Date.now() - BOOT_TIME)*0.001)};
  }
}

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';

import {repository} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from '@loopback/rest';
import {HubRepository} from '../repositories/hub.repository';
import {Hub} from '../models/hub.model';
import {DataObject} from '@loopback/repository/src/common-types';
import {eventBus} from '../crownstone/HubEventBus';
import {topics} from '../crownstone/topics';
import {UserRepository} from '../repositories';
import {CrownstoneHub} from '../crownstone/CrownstoneHub';
import {authenticate} from '@loopback/authentication';
import {HubStatus} from '../crownstone/HubStatus';
import {SecurityTypes} from '../constants/Constants';

/**
 * This controller will echo the state of the hub.
 */
export class HubController {

  constructor(
    @repository(HubRepository) protected hubRepo: HubRepository,
    @repository(UserRepository) protected userRepo: UserRepository,
  ) {}


  // returns a list of our objects
  @post('/hub')
  async createHub(
    @requestBody({
      content: {'application/json': { schema: getModelSchemaRef(Hub, { title: 'newHub', exclude: ['id','uartKey','accessToken','accessTokenExpiration'] })}},
    })
    newHub: DataObject<Hub>,
  ): Promise<void> {
    if (await this.hubRepo.isSet() === false) {
      return this.hubRepo.create(newHub)
        .then(() => {
          eventBus.emit(topics.HUB_CREATED);
        })
    }
    else {
      throw new HttpErrors.Forbidden("Hub already created and initialized.");
    }
  }

  // returns a list of our objects
  @post('/uartKey')
  @authenticate(SecurityTypes.admin)
  async setUartKey(
    @param.query.string('uartKey', {required:true}) uartKey: string,
  ): Promise<void> {
    let currentHub = await this.hubRepo.get()
    if (currentHub === null) {
      throw new HttpErrors.NotFound("No hub configured.");
    }
    else {
      if (uartKey.length !== 32) {
        throw new HttpErrors.BadRequest("UART key should be a hexstring key of 32 characters.");
      }
      currentHub.uartKey = uartKey;
      return this.hubRepo.update(currentHub)
        .then(() => {
          eventBus.emit(topics.HUB_UART_KEY_UPDATED);
        })
    }
  }

  @patch('/hub')
  @authenticate(SecurityTypes.admin)
  async updateHub(
    @requestBody({
      content: {'application/json': { schema: getModelSchemaRef(Hub, { title: 'newHub', exclude: ['id','uartKey','accessToken','accessTokenExpiration'] })}},
    })
      editedHub: DataObject<Hub>,
  ): Promise<void> {
    let currentHub = await this.hubRepo.get()
    if (currentHub === null) {
      return this.hubRepo.create(editedHub)
        .then(() => {
          eventBus.emit(topics.HUB_CREATED);
        })
    }
    else {
      if (editedHub.cloudId) { currentHub.cloudId = editedHub.cloudId; }
      if (editedHub.name)    { currentHub.name    = editedHub.name;    }
      if (editedHub.token)   { currentHub.token   = editedHub.token;   }

      return this.hubRepo.update(currentHub)
        .then(() => {
          eventBus.emit(topics.HUB_CREATED);
        })
    }
  }


  @del('/hub')
  // @authenticate(SecurityTypes.admin)
  async delete(
    @param.query.string('YesImSure', {required:true}) YesImSure: string,
  ): Promise<string> {
    if (YesImSure !== 'YesImSure') {
      throw new HttpErrors.BadRequest("YesImSure must be 'YesImSure'");
    }
    if (await this.hubRepo.isSet() === true) {
      eventBus.emit(topics.HUB_DELETED);
      await CrownstoneHub.cleanupAndDestroy();
      return "Success."
    }
    else {
      throw new HttpErrors.NotFound("No Hub to delete..");
    }
  }

  @get('/hubStatus')
  async getHubSatus(): Promise<HubStatus> {
    let currentHub = await this.hubRepo.get()
    if (currentHub === null) {
      throw new HttpErrors.NotFound("No hub configured.");
    }
    return HubStatus;
  }
}

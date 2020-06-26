// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';

import {repository} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from '@loopback/rest';
import {User} from '../models';
import {HubRepository} from '../repositories/hub.repository';
import {Hub} from '../models/hub.model';
import {DataObject} from '@loopback/repository/src/common-types';
import {eventBus} from '../crownstone/EventBus';
import {topics} from '../crownstone/topics';
import {UserRepository} from '../repositories';
import {CrownstoneHub} from '../crownstone/CrownstoneHub';

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
  @patch('/hub')
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
  async delete(): Promise<void> {
    if (await this.hubRepo.isSet() === false) {
      eventBus.emit(topics.HUB_DELETED);
      await CrownstoneHub.cleanupAndDestroy();
    }
    else {
      throw new HttpErrors.Forbidden("Hub already created and initialized.");
    }
  }
}

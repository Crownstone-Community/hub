import {DataObject, repository} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody} from '@loopback/rest';
import {FilterRepository} from '../repositories/cloud/filter.repository';
import {authenticate} from '@loopback/authentication';
import {SecurityTypes} from '../constants/Constants';
import {inject} from '@loopback/core';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';
import {Filter} from '../models/cloud/filter.model';

/**
 * This controller will echo the state of the hub.
 */
export class FilterController {

  constructor(
    @repository(FilterRepository) protected filterRepo: FilterRepository
  ) {}


  @get('/filters')
  @authenticate(SecurityTypes.sphere)
  async getAllFilters(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ): Promise<Filter[]> {
    return this.filterRepo.find({})
  }


  @get('/filters/{id}')
  @authenticate(SecurityTypes.sphere)
  async getAsset(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
  ): Promise<Filter> {
    return this.filterRepo.findById(id);
  }

}

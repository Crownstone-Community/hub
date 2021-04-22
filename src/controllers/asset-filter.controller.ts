import {DataObject, repository} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody} from '@loopback/rest';
import {AssetFilterRepository} from '../repositories/cloud/asset-filter.repository';
import {authenticate} from '@loopback/authentication';
import {SecurityTypes} from '../constants/Constants';
import {inject} from '@loopback/core';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';
import {AssetFilter} from '../models/cloud/asset-filter.model';
import {AssetFilterSetRepository} from '../repositories/cloud/asset-filter-set.repository';

/**
 * This controller will echo the state of the hub.
 */
export class AssetFilterController {

  constructor(
    @repository(AssetFilterRepository) protected filterRepo: AssetFilterRepository,
    @repository(AssetFilterSetRepository) protected filterSetRepo: AssetFilterSetRepository,
  ) {}


  @get('/assetFilters')
  @authenticate(SecurityTypes.sphere)
  async getAllFilters(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ): Promise<AssetFilter[]> {
    return this.filterRepo.find({})
  }


  @get('/assetFilters/{id}')
  @authenticate(SecurityTypes.sphere)
  async getFilter(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
  ): Promise<AssetFilter> {
    return this.filterRepo.findById(id);
  }

}

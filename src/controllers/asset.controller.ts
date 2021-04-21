import {DataObject, repository} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody} from '@loopback/rest';
import {AssetRepository} from '../repositories/cloud/asset.repository';
import {FilterRepository} from '../repositories/cloud/filter.repository';
import {FilterSetRepository} from '../repositories/cloud/filter-set.repository';
import {authenticate} from '@loopback/authentication';
import {SecurityTypes} from '../constants/Constants';
import {inject} from '@loopback/core';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';
import {Asset} from '../models/cloud/asset.model';

/**
 * This controller will echo the state of the hub.
 */
export class AssetController {

  constructor(
    @repository(AssetRepository) protected assetRepo: AssetRepository,
    @repository(FilterRepository) protected filterRepo: FilterRepository,
    @repository(FilterSetRepository) protected filterSetRepo: FilterSetRepository,
  ) {}


  @post('/assets')
  @authenticate(SecurityTypes.sphere)
  async createAsset(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    newAsset: DataObject<Asset>,
  ): Promise<Asset> {
    return this.assetRepo.create(newAsset);
  }


  @get('/assets')
  @authenticate(SecurityTypes.sphere)
  async getAllAssets(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ): Promise<Asset[]> {
    return this.assetRepo.find({})
  }


  @post('/assets/commit')
  @authenticate(SecurityTypes.sphere)
  async commitChanges(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
  ): Promise<void> {

  }


  @get('/assets/{id}')
  @authenticate(SecurityTypes.sphere)
  async getAsset(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
  ): Promise<Asset> {
    return this.assetRepo.findById(id);
  }


  @put('/assets/{id}')
  @authenticate(SecurityTypes.sphere)
  async updateAsset(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
    updatedModel: DataObject<Asset>,
  ): Promise<void> {
    return this.assetRepo.updateById(id, updatedModel)
  }


  @del('/assets/{id}')
  @authenticate(SecurityTypes.sphere)
  async deleteAsset(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.path.string('id') id: string,
  ): Promise<Count> {
    if (!id) { throw new HttpErrors.BadRequest("Invalid id"); }
    return this.assetRepo.deleteAll({id: id})
  }


  @del('/assets/all')
  @authenticate(SecurityTypes.sphere)
  async deleteAllAssets(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.string('YesImSure', {required:true}) YesImSure: string,
  ): Promise<Count> {
    if (YesImSure !== 'YesImSure') { throw new HttpErrors.BadRequest("YesImSure must be 'YesImSure'"); }
    return this.assetRepo.deleteAll()
  }
}

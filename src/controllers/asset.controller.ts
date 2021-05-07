import {DataObject, repository} from '@loopback/repository';
import {api, del, get, getModelSchemaRef, HttpErrors, param, patch, post, put, requestBody} from '@loopback/rest';
import {AssetRepository} from '../repositories/cloud/asset.repository';
import {AssetFilterRepository} from '../repositories/cloud/asset-filter.repository';
import {AssetFilterSetRepository} from '../repositories/cloud/asset-filter-set.repository';
import {authenticate} from '@loopback/authentication';
import {SecurityTypes} from '../constants/Constants';
import {inject} from '@loopback/core';
import {SecurityBindings} from '@loopback/security';
import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';
import {Asset} from '../models/cloud/asset.model';
import {reconstructFilters} from '../crownstone/filters/Filters';
import {CrownstoneHub} from '../crownstone/CrownstoneHub';

/**
 * This controller will echo the state of the hub.
 */
export class AssetController {

  constructor(
    @repository(AssetRepository)          protected assetRepo: AssetRepository,
    @repository(AssetFilterRepository)    protected filterRepo: AssetFilterRepository,
    @repository(AssetFilterSetRepository) protected filterSetRepo: AssetFilterSetRepository,
  ) {}


  @post('/assets')
  @authenticate(SecurityTypes.sphere)
  async createAsset(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(Asset, {
            title: 'newAsset',
            exclude: ['id','updatedAt','createdAt'],
          }),
        },
      },
      description: "Create a new asset to be tracked."}) newAsset: DataObject<Asset>,
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
    let allAssets = await this.assetRepo.find();
    let allFilters = await this.filterRepo.find();

    let changeRequired = await reconstructFilters(allAssets, allFilters);
    if (changeRequired) {
      CrownstoneHub.filters.refreshFilterSets()
    }
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
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: getModelSchemaRef(Asset, {
            title: 'UpdatedAsset',
            exclude: ["createdAt"]
          }),
        },
      },
      description: "update the asset"}) updatedModel: DataObject<Asset>,
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

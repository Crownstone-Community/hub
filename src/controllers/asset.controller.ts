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
import {FilterManager} from '../crownstone/filters/FilterManager';

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
            exclude: ['id','updatedAt','createdAt','committed','markedForDeletion'],
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
    let committedAssets = [];
    try {
      let uncomittedAssets = await this.assetRepo.find({where: {or: [{committed: false}, {markedForDeletion: true}]}});
      for (let asset of uncomittedAssets) {
        if (asset.markedForDeletion) {
          await this.assetRepo.delete(asset);
          continue;
        }
        committedAssets.push(asset);
        asset.committed = true;
        await this.assetRepo.save(asset);
      }

      let changeRequired = await FilterManager.reconstructFilters();
      if (changeRequired) {
        await FilterManager.refreshFilterSets();
      }
    }
    catch (err) {
      // revert the assets which were comitted to pending. This *should* resolve any issues.
      // Deleting assets should not cause problems so this is not reverted.
      for (let asset of committedAssets) {
        asset.committed = false;
        await this.assetRepo.save(asset);
      }

      let changeRequired = await FilterManager.reconstructFilters();
      if (changeRequired) {
        await FilterManager.refreshFilterSets();
      }

      console.error("Failed commit", err);
      throw err;
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
  ): Promise<string> {
    if (!id) { throw new HttpErrors.BadRequest("Invalid id"); }

    let asset = await this.assetRepo.findById(id);
    if (asset.committed === false) {
      await this.assetRepo.delete(asset);
      return "Done.";
    }

    asset.markedForDeletion = true;
    await this.assetRepo.save(asset);

    return "Call commit to actually delete this asset.";
  }


  @del('/assets/all')
  @authenticate(SecurityTypes.sphere)
  async deleteAllAssets(
    @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
    @param.query.string('YesImSure', {required:true}) YesImSure: string,
  ): Promise<string> {
    if (YesImSure !== 'YesImSure') { throw new HttpErrors.BadRequest("YesImSure must be 'YesImSure'"); }

    let assets = await this.assetRepo.find();
    let removed = 0;
    let marked = 0;
    for (let asset of assets) {
      if (asset.committed === false) {
        await this.assetRepo.delete(asset);
        removed++;
        continue;
      }

      asset.markedForDeletion = true;
      await this.assetRepo.save(asset);
      marked++;
    }

    if (marked > 0  && removed == 0) { return "Call commit to actually delete all assets"; }
    if (marked > 0  && removed > 0)  { return "Call commit to actually delete all assets. Some uncommitted assets have been removed."; }
    if (marked == 0 && removed > 0)  { return "All assets were uncomitted and are removed."; }

    return "Nothing to remove.";
  }
}

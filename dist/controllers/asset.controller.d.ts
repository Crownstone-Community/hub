import { DataObject } from '@loopback/repository';
import { AssetRepository } from '../repositories/cloud/asset.repository';
import { AssetFilterRepository } from '../repositories/cloud/asset-filter.repository';
import { AssetFilterSetRepository } from '../repositories/cloud/asset-filter-set.repository';
import { UserProfileDescription } from '../security/authentication-strategies/csToken-strategy';
import { Asset } from '../models/cloud/asset.model';
/**
 * This controller will echo the state of the hub.
 */
export declare class AssetController {
    protected assetRepo: AssetRepository;
    protected filterRepo: AssetFilterRepository;
    protected filterSetRepo: AssetFilterSetRepository;
    constructor(assetRepo: AssetRepository, filterRepo: AssetFilterRepository, filterSetRepo: AssetFilterSetRepository);
    createAsset(userProfile: UserProfileDescription, newAsset: DataObject<Asset>): Promise<Asset>;
    getAllAssets(userProfile: UserProfileDescription): Promise<Asset[]>;
    commitChanges(userProfile: UserProfileDescription): Promise<void>;
    getAsset(userProfile: UserProfileDescription, id: string): Promise<Asset>;
    updateAsset(userProfile: UserProfileDescription, id: string, updatedModel: DataObject<Asset>): Promise<void>;
    deleteAsset(userProfile: UserProfileDescription, id: string): Promise<Count>;
    deleteAllAssets(userProfile: UserProfileDescription, YesImSure: string): Promise<Count>;
}

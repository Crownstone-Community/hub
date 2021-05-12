import {
  EnergyDataRepository,
  EnergyDataProcessedRepository,
  HubRepository,
  DatabaseInfoRepository,
  UserRepository,
  UserPermissionRepository,
  SphereFeatureRepository,
  PowerDataRepository,
} from '../../src/repositories';
import {testdb} from "../fixtures/datasources/testdb.datasource";
import {AssetRepository} from '../../src/repositories/cloud/asset.repository';
import {AssetFilterRepository} from '../../src/repositories/cloud/asset-filter.repository';
import {AssetFilterSetRepository} from '../../src/repositories/cloud/asset-filter-set.repository';
import {WebhookRepository} from '../../src/repositories/hub-specific/webhook.repository';


/**
 * This clears the testDb for all users
 */
export async function clearTestDatabase() {
  let dbInfo          = new DatabaseInfoRepository(testdb);
  let hub             = new HubRepository(testdb);
  let userPermission  = new UserPermissionRepository(testdb);
  let user            = new UserRepository(testdb, userPermission);
  let sphereFeatures  = new SphereFeatureRepository(testdb);
  let power           = new PowerDataRepository(testdb);
  let energy          = new EnergyDataRepository(testdb);
  let energyProcessed = new EnergyDataProcessedRepository(testdb);

  let assetFilter    : AssetFilterRepository;
  let assetFilterSet : AssetFilterSetRepository;

  let filterGetter    = () : Promise<AssetFilterRepository>    => { return new Promise((resolve, _) => { resolve(assetFilter)    })}
  let filterSetGetter = () : Promise<AssetFilterSetRepository> => { return new Promise((resolve, _) => { resolve(assetFilterSet) })}

  let assets     = new AssetRepository(testdb, filterGetter);
  assetFilter    = new AssetFilterRepository(testdb, filterSetGetter, assets);
  assetFilterSet = new AssetFilterSetRepository(testdb, assetFilter);

  let webhooks   = new WebhookRepository(testdb);

  await dbInfo.deleteAll();
  await hub.deleteAll();
  await userPermission.deleteAll();
  await user.deleteAll();
  await sphereFeatures.deleteAll();
  await power.deleteAll();
  await energy.deleteAll();
  await energyProcessed.deleteAll();

  await assets.deleteAll();
  await assetFilter.deleteAll();
  await assetFilterSet.deleteAll();

  await webhooks.deleteAll();

}

import {
  DatabaseInfoRepository,
  EnergyDataRepository,
  HubRepository,
  PowerDataRepository,
  SphereFeatureRepository,
  SwitchDataRepository,
  UserPermissionRepository,
  UserRepository,
} from '../../repositories';
import {MemoryDb} from './MemoryDb';
import {Logger} from '../../Logger';
import {EnergyDataProcessedRepository} from '../../repositories/energy-data-processed.repository';


const logger = Logger(__filename);
class DbReferenceClass {
  dbInfo               : DatabaseInfoRepository
  hub                  : HubRepository
  power                : PowerDataRepository
  energy               : EnergyDataRepository
  energyProcessed      : EnergyDataProcessedRepository
  sphereFeatures       : SphereFeatureRepository
  switches             : SwitchDataRepository
  user                 : UserRepository
  userPermission       : UserPermissionRepository
}
export const Dbs = new DbReferenceClass();

export async function EMPTY_DATABASE() {
  logger.notice("Emptying database...")

  logger.info("Deleting All data from db...");
  let collections = await Dbs.hub.dataSource.connector?.db.listCollections().toArray();
  for (let i = 0; i < collections.length; i++) {
    let name = collections[i].name;
    if (name !== 'system.profile') {
      logger.info("Deleting " + collections[i].name + " data from db...");
      await Dbs.user.dataSource.connector?.collection(collections[i].name).drop();
    }
  }

  logger.info("Clearing in-memory db...");
  MemoryDb.stones = {};
  MemoryDb.locations = {};
  MemoryDb.locationByCloudId = {};
  logger.notice("Database emptied!");
}
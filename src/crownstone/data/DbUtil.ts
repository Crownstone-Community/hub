import {Logger} from '../../Logger';
import {MemoryDb} from './MemoryDb';
import {Dbs} from './DbReference';

const logger = Logger(__filename);
export async function EMPTY_DATABASE() {
  logger.notice("Emptying database...")

  logger.info("Deleting All data from db...");
  let collections = await Dbs.hub.dataSource.connector?.db.listCollections().toArray();
  for (let i = 0; i < collections.length; i++) {
    let name = collections[i].name;
    if (name !== 'system.profile') {
      logger.info("Deleting " + collections[i].name + " data from db...");
      await Dbs.hub.dataSource.connector?.collection(collections[i].name).drop();
    }
  }

  logger.info("Clearing in-memory db...");
  MemoryDb.stones = {};
  MemoryDb.locations = {};
  MemoryDb.locationByCloudId = {};
  logger.notice("Database emptied!");
}

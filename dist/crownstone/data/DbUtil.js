"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_DATABASE = void 0;
const Logger_1 = require("../../Logger");
const MemoryDb_1 = require("./MemoryDb");
const DbReference_1 = require("./DbReference");
const logger = (0, Logger_1.Logger)(__filename);
async function EMPTY_DATABASE() {
    logger.notice("Emptying database...");
    logger.info("Deleting All data from db...");
    let collections = await DbReference_1.Dbs.hub.dataSource.connector?.db.listCollections().toArray();
    for (let i = 0; i < collections.length; i++) {
        let name = collections[i].name;
        if (name !== 'system.profile') {
            logger.info("Deleting " + collections[i].name + " data from db...");
            await DbReference_1.Dbs.hub.dataSource.connector?.collection(collections[i].name).drop();
        }
    }
    logger.info("Clearing in-memory db...");
    MemoryDb_1.MemoryDb.stones = {};
    MemoryDb_1.MemoryDb.locations = {};
    MemoryDb_1.MemoryDb.locationByCloudId = {};
    logger.notice("Database emptied!");
}
exports.EMPTY_DATABASE = EMPTY_DATABASE;
//# sourceMappingURL=DbUtil.js.map
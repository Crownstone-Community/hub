"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_DATABASE = exports.Dbs = void 0;
const MemoryDb_1 = require("./MemoryDb");
const Logger_1 = require("../../Logger");
const logger = Logger_1.Logger(__filename);
class DbReferenceClass {
}
exports.Dbs = new DbReferenceClass();
async function EMPTY_DATABASE() {
    var _a, _b;
    logger.notice("Emptying database...");
    logger.info("Deleting All data from db...");
    let collections = await ((_a = exports.Dbs.hub.dataSource.connector) === null || _a === void 0 ? void 0 : _a.db.listCollections().toArray());
    for (let i = 0; i < collections.length; i++) {
        let name = collections[i].name;
        if (name !== 'system.profile') {
            logger.info("Deleting " + collections[i].name + " data from db...");
            await ((_b = exports.Dbs.user.dataSource.connector) === null || _b === void 0 ? void 0 : _b.collection(collections[i].name).drop());
        }
    }
    logger.info("Clearing in-memory db...");
    MemoryDb_1.MemoryDb.stones = {};
    MemoryDb_1.MemoryDb.locations = {};
    MemoryDb_1.MemoryDb.locationByCloudId = {};
    logger.notice("Database emptied!");
}
exports.EMPTY_DATABASE = EMPTY_DATABASE;
//# sourceMappingURL=DbReference.js.map
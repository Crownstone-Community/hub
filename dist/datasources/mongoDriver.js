"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDbConnector = void 0;
const tslib_1 = require("tslib");
const MongoClient = require('mongodb').MongoClient;
const mongo_datasource_config_1 = tslib_1.__importDefault(require("./mongo.datasource.config"));
class MongoDbConnector {
    constructor() {
        this.db = null;
        this.mongoClient = null;
    }
    async connect() {
        let url = 'mongodb://' + mongo_datasource_config_1.default.host + ":" + mongo_datasource_config_1.default.port;
        // Database Name
        const dbName = mongo_datasource_config_1.default.database;
        const client = new MongoClient(url, { useUnifiedTopology: true });
        // Use connect method to connect to the Server
        await client.connect();
        this.db = client.db(dbName);
    }
    async close() {
        if (this.mongoClient) {
            // @ts-ignore
            await this.mongoClient.close();
        }
        console.log(Date.now() + " Connector: Connection to mongo server closed.");
    }
}
exports.MongoDbConnector = MongoDbConnector;
//# sourceMappingURL=mongoDriver.js.map
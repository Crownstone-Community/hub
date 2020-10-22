"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.CrownstoneHubApplication = void 0;
const application_1 = require("./application");
Object.defineProperty(exports, "CrownstoneHubApplication", { enumerable: true, get: function () { return application_1.CrownstoneHubApplication; } });
const repositories_1 = require("./repositories");
const DbReference_1 = require("./crownstone/Data/DbReference");
const CrownstoneHub_1 = require("./crownstone/CrownstoneHub");
// import {MongoDbConnector} from './datasources/mongoDriver';
const server_1 = require("./server");
const Logger_1 = require("./Logger");
const energy_data_processed_repository_1 = require("./repositories/energy-data-processed.repository");
const mongoDriver_1 = require("./datasources/mongoDriver");
const log = Logger_1.Logger(__filename);
Error.stackTraceLimit = 100;
async function main(options = {}) {
    application_1.updateLoggingBasedOnConfig();
    log.info(`Creating Server...`);
    const server = new server_1.ExpressServer();
    log.info(`Server Booting...`);
    await server.boot();
    log.info(`Server starting...`);
    await server.start();
    log.info(`Server started.`);
    log.info(`Creating Database References...`);
    DbReference_1.DbRef.dbInfo = await server.lbApp.getRepository(repositories_1.DatabaseInfoRepository);
    DbReference_1.DbRef.hub = await server.lbApp.getRepository(repositories_1.HubRepository);
    DbReference_1.DbRef.power = await server.lbApp.getRepository(repositories_1.PowerDataRepository);
    DbReference_1.DbRef.energy = await server.lbApp.getRepository(repositories_1.EnergyDataRepository);
    DbReference_1.DbRef.energyProcessed = await server.lbApp.getRepository(energy_data_processed_repository_1.EnergyDataProcessedRepository);
    DbReference_1.DbRef.user = await server.lbApp.getRepository(repositories_1.UserRepository);
    DbReference_1.DbRef.userPermission = await server.lbApp.getRepository(repositories_1.UserPermissionRepository);
    DbReference_1.DbRef.switches = await server.lbApp.getRepository(repositories_1.SwitchDataRepository);
    DbReference_1.DbRef.sphereFeatures = await server.lbApp.getRepository(repositories_1.SphereFeatureRepository);
    await migrate();
    await maintainIndexes();
    log.info(`Initializing CrownstoneHub...`);
    await CrownstoneHub_1.CrownstoneHub.initialize();
    //
    // console.log(`Server is running at ${host}:${port}`);
    log.info(`Server initialized!`);
    // setTimeout(() => { app.controller(MeshController)}, 10000)
    return server.lbApp;
    ;
}
exports.main = main;
async function migrate() {
    console.time("migrate");
    let databaseInfo = await DbReference_1.DbRef.dbInfo.findOne();
    if (databaseInfo === null) {
        await DbReference_1.DbRef.dbInfo.create({ version: 0 });
        databaseInfo = await DbReference_1.DbRef.dbInfo.findOne();
    }
    // this won't happen but it makes the typescript happy!
    if (databaseInfo === null) {
        return;
    }
    if (databaseInfo.version === 0) {
        let noIntervalCount = await DbReference_1.DbRef.energyProcessed.count();
        if (noIntervalCount.count > 0) {
            await DbReference_1.DbRef.energyProcessed.updateAll({ interval: "1m" });
        }
        databaseInfo.version = 1;
        await DbReference_1.DbRef.dbInfo.update(databaseInfo);
    }
    console.timeEnd("migrate");
}
async function maintainIndexes() {
    const connector = new mongoDriver_1.MongoDbConnector();
    await connector.connect();
    const processedEnergyCollection = connector.db.collection('EnergyDataProcessed');
    console.time('index');
    processedEnergyCollection.createIndexes([
        { key: { stoneUID: 1, interval: 1 } },
        { key: { stoneUID: 1, interval: 1, timestamp: 1 } },
        { key: { stoneUID: 1, interval: 1, timestamp: -1 } },
    ]);
    console.timeEnd('index');
}
//# sourceMappingURL=index.js.map
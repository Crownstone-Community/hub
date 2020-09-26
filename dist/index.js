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
const log = Logger_1.Logger(__filename);
Error.stackTraceLimit = 100;
async function main(options = {}) {
    var _a;
    application_1.updateLoggingBasedOnConfig();
    log.info(`Creating Server...`);
    const server = new server_1.ExpressServer();
    log.info(`Server Booting...`);
    await server.boot();
    log.info(`Server starting...`);
    await server.start();
    log.info(`Server started.`);
    const port = (_a = server.lbApp.restServer.config.port) !== null && _a !== void 0 ? _a : 3000;
    // const host = server.lbApp.restServer.config.host ?? 'NO-HOST';
    log.info(`Creating Database References...`);
    DbReference_1.DbRef.hub = await server.lbApp.getRepository(repositories_1.HubRepository);
    DbReference_1.DbRef.power = await server.lbApp.getRepository(repositories_1.PowerDataRepository);
    DbReference_1.DbRef.energy = await server.lbApp.getRepository(repositories_1.EnergyDataRepository);
    DbReference_1.DbRef.energyProcessed = await server.lbApp.getRepository(repositories_1.EnergyDataProcessedRepository);
    DbReference_1.DbRef.user = await server.lbApp.getRepository(repositories_1.UserRepository);
    DbReference_1.DbRef.userPermission = await server.lbApp.getRepository(repositories_1.UserPermissionRepository);
    DbReference_1.DbRef.switches = await server.lbApp.getRepository(repositories_1.SwitchDataRepository);
    DbReference_1.DbRef.sphereFeatures = await server.lbApp.getRepository(repositories_1.SphereFeatureRepository);
    // const connector = new MongoDbConnector()
    // await connector.connect();
    // const energyCollection = connector.db.collection('EnergyData');
    // console.time('index')
    // energyCollection.createIndexes([
    //   {key:{uploaded:1, stoneUID: 1, timestamp: 1}},
    // ]);
    // console.timeEnd('index')
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
//# sourceMappingURL=index.js.map
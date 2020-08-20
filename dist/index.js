"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.CrownstoneHubApplication = void 0;
const tslib_1 = require("tslib");
const application_1 = require("./application");
Object.defineProperty(exports, "CrownstoneHubApplication", { enumerable: true, get: function () { return application_1.CrownstoneHubApplication; } });
const fs = tslib_1.__importStar(require("fs"));
const VerifyCertificates_1 = require("./security/VerifyCertificates");
const repositories_1 = require("./repositories");
const DbReference_1 = require("./crownstone/Data/DbReference");
const CrownstoneHub_1 = require("./crownstone/CrownstoneHub");
Error.stackTraceLimit = 100;
async function main(options = {}) {
    let path = await VerifyCertificates_1.verifyCertificate();
    console.log("USING", path + '/key.pem', path + '/cert.pem');
    let httpsOptions = {
        rest: {
            ...options.rest,
            protocol: 'https',
            key: fs.readFileSync(path + '/key.pem'),
            cert: fs.readFileSync(path + '/cert.pem'),
        },
    };
    const app = new application_1.CrownstoneHubApplication(httpsOptions);
    await app.boot();
    await app.start();
    const url = app.restServer.url;
    DbReference_1.DbRef.hub = await app.getRepository(repositories_1.HubRepository);
    DbReference_1.DbRef.power = await app.getRepository(repositories_1.PowerDataRepository);
    DbReference_1.DbRef.energy = await app.getRepository(repositories_1.EnergyDataRepository);
    DbReference_1.DbRef.user = await app.getRepository(repositories_1.UserRepository);
    DbReference_1.DbRef.switches = await app.getRepository(repositories_1.SwitchDataRepository);
    await CrownstoneHub_1.CrownstoneHub.initialize();
    console.log(`Server is running at ${url}`);
    return app;
}
exports.main = main;
//# sourceMappingURL=index.js.map
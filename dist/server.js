"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressServer = void 0;
const tslib_1 = require("tslib");
const events_1 = require("events");
const express_1 = tslib_1.__importDefault(require("express"));
const https_1 = tslib_1.__importDefault(require("https"));
const path_1 = tslib_1.__importDefault(require("path"));
const application_1 = require("./application");
const fs_1 = tslib_1.__importDefault(require("fs"));
const VerifyCertificates_1 = require("./security/VerifyCertificates");
const csToken_strategy_1 = require("./security/authentication-strategies/csToken-strategy");
const rest_1 = require("@loopback/rest");
const services_1 = require("./services");
const DbReference_1 = require("./crownstone/Data/DbReference");
const ConfigUtil_1 = require("./util/ConfigUtil");
const config = {
    rest: {
        // Use the LB4 application as a route. It should not be listening.
        listenOnStart: false,
    },
};
class ExpressServer {
    constructor(options = {}) {
        this.app = express_1.default();
        this.lbApp = new application_1.CrownstoneHubApplication(config);
        // Expose the front-end assets via Express, not as LB4 route
        this.app.use('/api', this.lbApp.requestHandler);
        // Custom Express routes
        this.app.get('/', function (_req, res) {
            res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
        });
        this.app.get('/enableLogging', async (req, res) => {
            try {
                let access_token = csToken_strategy_1.extractToken(req);
                let userData = await services_1.checkAccessToken(access_token, DbReference_1.DbRef.user);
                if (userData.sphereRole === 'admin') {
                    let config = ConfigUtil_1.getHubConfig();
                    config.useLogControllers = true;
                    ConfigUtil_1.storeHubConfig(config);
                    application_1.updateControllersBasedOnConfig(this.lbApp);
                    res.end("Command accepted. LoggingController is now enabled.");
                }
            }
            catch (e) {
                res.end(JSON.stringify(new rest_1.HttpErrors.Unauthorized()));
            }
        });
        this.app.get('/disableLogging', async (req, res) => {
            try {
                let access_token = csToken_strategy_1.extractToken(req);
                let userData = await services_1.checkAccessToken(access_token, DbReference_1.DbRef.user);
                if (userData.sphereRole === 'admin') {
                    let config = ConfigUtil_1.getHubConfig();
                    config.useLogControllers = false;
                    ConfigUtil_1.storeHubConfig(config);
                    res.end("Command accepted. LoggingController will be disabled. Changed will take effect on next reboot.");
                    setTimeout(() => {
                        process.exit();
                    }, 2000);
                }
            }
            catch (e) {
                res.end(JSON.stringify(new rest_1.HttpErrors.Unauthorized()));
            }
        });
        this.app.get('/vis', async (req, res) => {
            try {
                res.sendFile(path_1.default.join(__dirname, '../public/energyViewer/index.html'));
                // let access_token = extractToken(req);
                // let userData = await checkAccessToken(access_token, DbRef.user);
                // if (userData) {
                // }
            }
            catch (e) {
                res.end(JSON.stringify(new rest_1.HttpErrors.Unauthorized()));
            }
        });
        // Serve static files in the public folder
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
    }
    async boot() {
        await this.lbApp.boot();
    }
    async start() {
        var _a, _b;
        await this.lbApp.start();
        application_1.updateControllersBasedOnConfig(this.lbApp);
        const port = (_a = this.lbApp.restServer.config.port) !== null && _a !== void 0 ? _a : 3000;
        const host = (_b = this.lbApp.restServer.config.host) !== null && _b !== void 0 ? _b : 'NO-HOST';
        let path = await VerifyCertificates_1.verifyCertificate();
        let httpsOptions = {
            protocol: 'https',
            key: fs_1.default.readFileSync(path + '/key.pem'),
            cert: fs_1.default.readFileSync(path + '/cert.pem'),
        };
        this.server = https_1.default.createServer(httpsOptions, this.app).listen(port, host);
        await events_1.once(this.server, 'listening');
    }
    // For testing purposes
    async stop() {
        if (!this.server)
            return;
        await this.lbApp.stop();
        this.server.close();
        await events_1.once(this.server, 'close');
        this.server = undefined;
    }
}
exports.ExpressServer = ExpressServer;
//# sourceMappingURL=server.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDeveloperRoutes = void 0;
const csToken_strategy_1 = require("../security/authentication-strategies/csToken-strategy");
const services_1 = require("../services");
const DbReference_1 = require("../crownstone/Data/DbReference");
const ConfigUtil_1 = require("../util/ConfigUtil");
const application_1 = require("../application");
const rest_1 = require("@loopback/rest");
function addDeveloperRoutes(app, loopbackApp) {
    app.get('/enableDeveloperMode', async (req, res) => {
        try {
            let access_token = csToken_strategy_1.extractToken(req);
            let userData = await services_1.checkAccessToken(access_token, DbReference_1.Dbs.user);
            if (userData.sphereRole === 'admin') {
                let config = ConfigUtil_1.getHubConfig();
                config.useDevControllers = true;
                ConfigUtil_1.storeHubConfig(config);
                application_1.updateControllersBasedOnConfig(loopbackApp);
                res.end("Command accepted. DebuggingController is now enabled.");
            }
        }
        catch (e) {
            res.end(JSON.stringify(new rest_1.HttpErrors.Unauthorized()));
        }
    });
    app.get('/disableDeveloperMode', async (req, res) => {
        try {
            let access_token = csToken_strategy_1.extractToken(req);
            let userData = await services_1.checkAccessToken(access_token, DbReference_1.Dbs.user);
            if (userData.sphereRole === 'admin') {
                let config = ConfigUtil_1.getHubConfig();
                config.useDevControllers = false;
                ConfigUtil_1.storeHubConfig(config);
                res.end("Command accepted. DebuggingController will be disabled. Changed will take effect on next reboot.");
                setTimeout(() => {
                    process.exit();
                }, 2000);
            }
        }
        catch (e) {
            res.end(JSON.stringify(new rest_1.HttpErrors.Unauthorized()));
        }
    });
}
exports.addDeveloperRoutes = addDeveloperRoutes;
//# sourceMappingURL=DeveloperRoutes.js.map
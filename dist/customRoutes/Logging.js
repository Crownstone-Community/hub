"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLoggingRoutes = void 0;
const csToken_strategy_1 = require("../security/authentication-strategies/csToken-strategy");
const services_1 = require("../services");
const DbReference_1 = require("../crownstone/Data/DbReference");
const ConfigUtil_1 = require("../util/ConfigUtil");
const application_1 = require("../application");
const rest_1 = require("@loopback/rest");
function addLoggingRoutes(app, loopbackApp) {
    app.get('/enableLogging', async (req, res) => {
        try {
            let access_token = csToken_strategy_1.extractToken(req);
            let userData = await services_1.checkAccessToken(access_token, DbReference_1.DbRef.user);
            if (userData.sphereRole === 'admin') {
                let config = ConfigUtil_1.getHubConfig();
                config.useLogControllers = true;
                ConfigUtil_1.storeHubConfig(config);
                application_1.updateControllersBasedOnConfig(loopbackApp);
                res.end("Command accepted. LoggingController is now enabled.");
            }
        }
        catch (e) {
            res.end(JSON.stringify(new rest_1.HttpErrors.Unauthorized()));
        }
    });
    app.get('/disableLogging', async (req, res) => {
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
}
exports.addLoggingRoutes = addLoggingRoutes;
//# sourceMappingURL=Logging.js.map
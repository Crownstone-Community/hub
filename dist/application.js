"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLoggingBasedOnConfig = exports.updateControllersBasedOnConfig = exports.CrownstoneHubApplication = exports.BOOT_TIME = void 0;
const tslib_1 = require("tslib");
const boot_1 = require("@loopback/boot");
const rest_explorer_1 = require("@loopback/rest-explorer");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const service_proxy_1 = require("@loopback/service-proxy");
const path_1 = tslib_1.__importDefault(require("path"));
const sequence_1 = require("./sequence");
const authentication_1 = require("@loopback/authentication");
const authorization_1 = require("@loopback/authorization");
const csToken_strategy_1 = require("./security/authentication-strategies/csToken-strategy");
const services_1 = require("./services");
const ConfigUtil_1 = require("./util/ConfigUtil");
const log_controller_1 = require("./controllers/logging/log.controller");
const csAdminToken_strategy_1 = require("./security/authentication-strategies/csAdminToken-strategy");
const Logger_1 = require("./Logger");
const pkg = require('../package.json');
const log = Logger_1.Logger(__filename);
exports.BOOT_TIME = Date.now();
class CrownstoneHubApplication extends boot_1.BootMixin(service_proxy_1.ServiceMixin(repository_1.RepositoryMixin(rest_1.RestApplication))) {
    constructor(options = {}) {
        let executionPath = __dirname;
        if (options.customPath !== undefined) {
            executionPath = options.customPath;
        }
        let customPort = process.env.PORT || 5050;
        if (options.rest && options.rest.port !== undefined) {
            customPort = options.rest.port;
        }
        super({ ...options, rest: { ...options.rest, port: customPort } });
        this.api({
            openapi: '3.0.0',
            info: { title: pkg.name, version: pkg.version },
            paths: {},
            components: { securitySchemes: { sphereAuthorizationToken: {
                        type: 'apiKey',
                        in: 'header',
                        name: 'access_token'
                    } } },
            servers: [{ url: '/api' }],
            security: [{ sphereAuthorizationToken: [] }]
        });
        this.setUpBindings();
        // Bind authentication component related elements
        this.component(authentication_1.AuthenticationComponent);
        this.component(authorization_1.AuthorizationComponent);
        // authentication
        authentication_1.registerAuthenticationStrategy(this, csToken_strategy_1.CsTokenStrategy);
        authentication_1.registerAuthenticationStrategy(this, csAdminToken_strategy_1.CsAdminTokenStrategy);
        // Set up the custom sequence
        this.sequence(sequence_1.CrownstoneSequence);
        // Set up default home page
        this.static('/', path_1.default.join(executionPath, '../public'));
        // Customize @loopback/rest-explorer configuration here
        this.configure(rest_explorer_1.RestExplorerBindings.COMPONENT).to({ path: '/explorer' });
        this.component(rest_explorer_1.RestExplorerComponent);
        this.projectRoot = executionPath;
        // Customize @loopback/boot Booter Conventions here
        this.bootOptions = {
            controllers: {
                // Customize ControllerBooter Conventions here
                dirs: ['controllers'],
                extensions: ['.controller.js'],
                nested: false,
            },
        };
    }
    setUpBindings() {
        this.bind("UserService").toClass(services_1.UserService);
    }
}
exports.CrownstoneHubApplication = CrownstoneHubApplication;
function updateControllersBasedOnConfig(app) {
    let hubConfig = ConfigUtil_1.getHubConfig();
    if (hubConfig.useLogControllers) {
        app.controller(log_controller_1.LogController);
    }
}
exports.updateControllersBasedOnConfig = updateControllersBasedOnConfig;
function updateLoggingBasedOnConfig() {
    let hubConfig = ConfigUtil_1.getHubConfig();
    let individualFileLoggingEnabled = false;
    let loggers = log.config.getLoggerIds();
    let overrideLoggerIds = Object.keys(hubConfig.logging);
    // check if file logging is required for an individual logger.
    overrideLoggerIds.forEach((loggerId) => {
        if (loggers.indexOf(loggerId) !== -1) {
            if (hubConfig.logging[loggerId].file !== 'none') {
                individualFileLoggingEnabled = true;
            }
        }
    });
    if (individualFileLoggingEnabled) {
        log.config.setFileLogging(true);
    }
    overrideLoggerIds.forEach((loggerId) => {
        if (loggers.indexOf(loggerId) !== -1) {
            let transports = log.config.getTransportForLogger(loggerId);
            if (transports) {
                transports.console.level = hubConfig.logging[loggerId].console;
                if (transports.file) {
                    transports.file.level = hubConfig.logging[loggerId].file;
                }
            }
        }
    });
}
exports.updateLoggingBasedOnConfig = updateLoggingBasedOnConfig;
//# sourceMappingURL=application.js.map
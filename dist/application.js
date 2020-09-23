"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateControllersBasedOnConfig = exports.CrownstoneHubApplication = void 0;
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
const pkg = require('../package.json');
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
        let customHost = process.env.HOST || '127.0.0.1';
        if (options.rest && options.rest.host !== undefined) {
            customHost = options.rest.host;
        }
        super({ ...options, rest: { ...options.rest, port: customPort, host: customHost } });
        this.api({
            openapi: '3.0.0',
            info: { title: pkg.name, version: pkg.version },
            paths: {},
            components: { securitySchemes: { csTokens: {
                        type: 'apiKey',
                        in: 'query',
                        name: 'access_token'
                    } } },
            servers: [{ url: '/api' }],
            security: [{ csTokens: [] }],
        });
        this.setUpBindings();
        // Bind authentication component related elements
        this.component(authentication_1.AuthenticationComponent);
        this.component(authorization_1.AuthorizationComponent);
        // authentication
        authentication_1.registerAuthenticationStrategy(this, csToken_strategy_1.CsTokenStrategy);
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
    console.log("HERE", hubConfig);
    if (hubConfig.useLogControllers) {
        app.controller(log_controller_1.LogController);
    }
}
exports.updateControllersBasedOnConfig = updateControllersBasedOnConfig;
//# sourceMappingURL=application.js.map
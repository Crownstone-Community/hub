import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {CrownstoneSequence} from './sequence';
import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {AuthorizationComponent} from '@loopback/authorization';
import {CsTokenStrategy} from './security/authentication-strategies/csToken-strategy';
import {UserService} from './services';
import {getHubConfig} from './util/ConfigUtil';
import {LogController} from './controllers/logging/log.controller';
import {CsAdminTokenStrategy} from './security/authentication-strategies/csAdminToken-strategy';
import {Logger} from './Logger';

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
const pkg: PackageInfo = require('../package.json');
const log = Logger(__filename);

export class CrownstoneHubApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    let executionPath = __dirname;
    if (options.customPath !== undefined) { executionPath = options.customPath; }
    let customPort = process.env.PORT || 5050;
    if (options.rest && options.rest.port !== undefined) {
      customPort = options.rest.port;
    }

    super({...options, rest: { ...options.rest, port: customPort }})

    this.api({
      openapi: '3.0.0',
      info: {title: pkg.name, version: pkg.version},
      paths: {},
      components: {securitySchemes: {sphereAuthorizationToken: {
        type: 'apiKey',
        in: 'header',
        name:'access_token'
      }}},
      servers:  [{url: '/api'}],
      security: [{sphereAuthorizationToken: []}]
    });


    this.setUpBindings();
    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    this.component(AuthorizationComponent);

    // authentication
    registerAuthenticationStrategy(this, CsTokenStrategy);
    registerAuthenticationStrategy(this, CsAdminTokenStrategy);

    // Set up the custom sequence
    this.sequence(CrownstoneSequence);

    // Set up default home page
    this.static('/', path.join(executionPath, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({ path: '/explorer' });
    this.component(RestExplorerComponent);

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

  setUpBindings(): void {
    this.bind("UserService").toClass(UserService);
  }
}


export function updateControllersBasedOnConfig(app : CrownstoneHubApplication) {
  let hubConfig = getHubConfig();
  if (hubConfig.useLogControllers) {
    app.controller(LogController)
  }
}

export function updateLoggingBasedOnConfig() {
  let hubConfig = getHubConfig();
  log.config.setConsoleLevel(hubConfig.logging.consoleLevel)
  log.config.setFileLevel(hubConfig.logging.fileLevel)
  log.config.setFileLogging(hubConfig.logging.fileLoggingEnabled)
}
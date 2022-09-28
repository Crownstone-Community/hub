"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicExpressServer = void 0;
const tslib_1 = require("tslib");
const events_1 = require("events");
const express_1 = tslib_1.__importDefault(require("express"));
const http_1 = tslib_1.__importDefault(require("http"));
const cors_1 = tslib_1.__importDefault(require("cors"));
const path_1 = tslib_1.__importDefault(require("path"));
const Logger_1 = require("./Logger");
const HubUtil_1 = require("./util/HubUtil");
const ConfigUtil_1 = require("./util/ConfigUtil");
const ApplyCustomRoutes_1 = require("./customRoutes/ApplyCustomRoutes");
const log = (0, Logger_1.Logger)(__filename);
const config = {
    rest: {
        // Use the LB4 application as a route. It should not be listening.
        listenOnStart: false,
    },
};
class PublicExpressServer {
    constructor(options = {}, lbApp) {
        this.app = (0, express_1.default)();
        this.app.use((0, cors_1.default)());
        this.httpPort = (0, ConfigUtil_1.getHttpPort)();
        this.httpsPort = (0, ConfigUtil_1.getHttpsPort)();
        // Custom Express routes
        this.app.get('/', function (req, res) {
            res.sendFile(path_1.default.join(__dirname, '../public/http/index.html'));
        });
        // Expose the front-end assets via Express, not as LB4 route
        this.app.use('/api', lbApp.requestHandler);
        (0, ApplyCustomRoutes_1.applyCustomRoutes)(this.app, lbApp);
        this.app.get('/forward', (req, res) => {
            let ipAddress = (0, HubUtil_1.getIpAddress)();
            res.writeHead(302, {
                Location: `https://${ipAddress}:${this.httpsPort}/`
            });
            res.end();
        });
        // Serve static files in the public folder
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../public/http')));
    }
    async start() {
        this.server = http_1.default.createServer(this.app).listen(this.httpPort, () => {
            let ipAddress = (0, HubUtil_1.getIpAddress)();
            log.info(`Hub is available at http://${ipAddress}:${this.httpPort}`);
        });
        await (0, events_1.once)(this.server, 'listening');
    }
    // For testing purposes
    async stop() {
        if (!this.server)
            return;
        this.server.close();
        await (0, events_1.once)(this.server, 'close');
        this.server = undefined;
    }
}
exports.PublicExpressServer = PublicExpressServer;
//# sourceMappingURL=server_public.js.map
"use strict";
// Uncomment these imports to begin using these cool features!
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogController = void 0;
const tslib_1 = require("tslib");
// import {inject} from '@loopback/context';
const rest_1 = require("@loopback/rest");
const authentication_1 = require("@loopback/authentication");
const Logger_1 = require("../../Logger");
const context_1 = require("@loopback/context");
const security_1 = require("@loopback/security");
const ReturnCodes_1 = require("../returnCodes/ReturnCodes");
const fs = tslib_1.__importStar(require("fs"));
const ConfigUtil_1 = require("../../util/ConfigUtil");
const path_1 = tslib_1.__importDefault(require("path"));
const Constants_1 = require("../../constants/Constants");
const application_1 = require("../../application");
const log = (0, Logger_1.Logger)(__filename);
let AVAILABLE_LEVELS = ["none", "critical", "error", "warn", "notice", "info", "debug", "verbose", "silly"];
class LogController {
    constructor() { }
    async getLoggers(userProfile) {
        let loggerIds = log.config.getLoggerIds();
        let data = {};
        loggerIds.forEach((loggerId) => {
            let transport = log.config.getTransportForLogger(loggerId);
            data[loggerId] = { console: transport?.console.level || "info", file: transport?.file?.level || 'none' };
        });
        return data;
    }
    async setIndividualLevels(userProfile, loggerConfig) {
        let loggerIds = log.config.getLoggerIds();
        let providedKeys = Object.keys(loggerConfig);
        let hubConfig = (0, ConfigUtil_1.getHubConfig)();
        for (let i = 0; i < providedKeys.length; i++) {
            let loggerId = providedKeys[i];
            let levels = loggerConfig[loggerId];
            if (loggerIds.indexOf(loggerId) === -1) {
                throw new rest_1.HttpErrors.BadRequest("Invalid loggerId:" + loggerId);
            }
            let currentLevels = hubConfig.logging[loggerId];
            if (!currentLevels) {
                currentLevels = {
                    console: (process.env.CS_CONSOLE_LOGGING_LEVEL || 'info'),
                    file: (process.env.CS_FILE_LOGGING_LEVEL || 'info'),
                };
            }
            // restore defaults and remove override.
            if (levels === null || levels === 'null') {
                let transports = log.config.getTransportForLogger(loggerId);
                if (transports) {
                    transports.console.level = (process.env.CS_CONSOLE_LOGGING_LEVEL || 'info');
                    if (transports.file) {
                        transports.file.level = (process.env.CS_FILE_LOGGING_LEVEL || 'info');
                    }
                }
                delete hubConfig.logging[loggerId];
                continue;
            }
            if (levels.console) {
                if (AVAILABLE_LEVELS.indexOf(levels.console) === -1) {
                    throw new rest_1.HttpErrors.BadRequest("Invalid level:" + levels.console);
                }
                currentLevels.console = levels.console;
            }
            if (levels.file) {
                if (AVAILABLE_LEVELS.indexOf(levels.file) === -1) {
                    throw new rest_1.HttpErrors.BadRequest("Invalid level:" + levels.file);
                }
                currentLevels.file = levels.file;
            }
            hubConfig.logging[loggerId] = currentLevels;
        }
        (0, ConfigUtil_1.storeHubConfig)(hubConfig);
        (0, application_1.updateLoggingBasedOnConfig)();
    }
    async clearIndividualLevels(userProfile) {
        let hubConfig = (0, ConfigUtil_1.getHubConfig)();
        let providedKeys = Object.keys(hubConfig.logging);
        let loggerIds = log.config.getLoggerIds();
        for (let i = 0; i < providedKeys.length; i++) {
            let loggerId = providedKeys[i];
            if (loggerIds.indexOf(loggerId) === -1) {
                continue;
            }
            // restore defaults and remove override.
            let transports = log.config.getTransportForLogger(loggerId);
            if (transports) {
                transports.console.level = (process.env.CS_CONSOLE_LOGGING_LEVEL || 'info');
                if (transports.file) {
                    transports.file.level = (process.env.CS_FILE_LOGGING_LEVEL || 'info');
                }
            }
            continue;
        }
        hubConfig.logging = {};
        (0, ConfigUtil_1.storeHubConfig)(hubConfig);
    }
    async availableLogFiles(userProfile) {
        let logPath = process.env.CS_FILE_LOGGING_DIRNAME;
        if (!logPath || logPath === undefined) {
            return [];
        }
        if (!fs.existsSync(logPath)) {
            return [];
        }
        let items = fs.readdirSync(logPath);
        let logItems = [];
        let expectedFileBase = process.env.CS_FILE_LOGGING_BASENAME || 'crownstone-log';
        items.forEach((item) => {
            if (item.indexOf(expectedFileBase + "-2") !== -1) {
                let stats = fs.statSync(path_1.default.join(logPath, item));
                var fileSizeInBytes = stats["size"];
                logItems.push({ filename: item, sizeMB: fileSizeInBytes / Math.pow(1024, 2) });
            }
        });
        return logItems;
    }
    async downloadLogFile(userProfile, filename, response) {
        if (!filename) {
            throw new rest_1.HttpErrors.notFound();
        }
        const fileBasename = path_1.default.basename(filename);
        let logPath = process.env.CS_FILE_LOGGING_DIRNAME;
        if (!fileBasename) {
            throw new rest_1.HttpErrors.notFound();
        }
        if (!logPath || logPath === undefined) {
            throw new rest_1.HttpErrors.notFound();
        }
        if (!fs.existsSync(path_1.default.join(logPath, fileBasename))) {
            throw new rest_1.HttpErrors.NotFound();
        }
        // @ts-ignore
        response.download(path_1.default.join(logPath, fileBasename));
        return response;
    }
    async deleteAllLogs(userProfile) {
        let logPath = process.env.CS_FILE_LOGGING_DIRNAME;
        if (!logPath || logPath === undefined) {
            return;
        }
        if (!fs.existsSync(logPath)) {
            return;
        }
        let items = fs.readdirSync(logPath);
        let expectedFileBase = process.env.CS_FILE_LOGGING_BASENAME || 'crownstone-log';
        items.forEach((item) => {
            if (item.indexOf(expectedFileBase + "-2") !== -1) {
                fs.unlinkSync(path_1.default.join(logPath, item));
            }
        });
    }
}
tslib_1.__decorate([
    (0, rest_1.get)('/individualLogLevels'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "getLoggers", null);
tslib_1.__decorate([
    (0, rest_1.post)('/individualLogLevels', ReturnCodes_1.EmptyReturnCode),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, (0, rest_1.requestBody)({ 'application/json': { example: { loggerId: { console: 'info', file: 'none' } } } })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "setIndividualLevels", null);
tslib_1.__decorate([
    (0, rest_1.del)('/individualLogLevels', ReturnCodes_1.EmptyReturnCode),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "clearIndividualLevels", null);
tslib_1.__decorate([
    (0, rest_1.get)('/availableLogFiles', ReturnCodes_1.EmptyReturnCode),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "availableLogFiles", null);
tslib_1.__decorate([
    (0, rest_1.get)('/downloadLogFile'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    rest_1.oas.response.file(),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.string('filename', { required: true })),
    tslib_1.__param(2, (0, context_1.inject)(rest_1.RestBindings.Http.RESPONSE)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "downloadLogFile", null);
tslib_1.__decorate([
    (0, rest_1.del)('/deleteAllLogs', ReturnCodes_1.EmptyReturnCode),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "deleteAllLogs", null);
exports.LogController = LogController;
//# sourceMappingURL=log.controller.js.map
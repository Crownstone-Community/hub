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
const log = Logger_1.Logger(__filename);
let AVAILABLE_LEVELS = ["none", "critical", "error", "warn", "notice", "info", "debug", "verbose", "silly"];
class LogController {
    constructor() { }
    async setLogLevel(userProfile, consoleLevel, fileLevel) {
        if (consoleLevel && AVAILABLE_LEVELS.indexOf(consoleLevel) === -1) {
            throw new rest_1.HttpErrors.BadRequest("consoleLevel must be one of these: " + AVAILABLE_LEVELS.join(", "));
        }
        if (fileLevel && AVAILABLE_LEVELS.indexOf(fileLevel) === -1) {
            throw new rest_1.HttpErrors.BadRequest("fileLevel must be one of these: " + AVAILABLE_LEVELS.join(", "));
        }
        let hubConfig = ConfigUtil_1.getHubConfig();
        if (consoleLevel) {
            hubConfig.logging.consoleLevel = consoleLevel;
            log.config.setConsoleLevel(consoleLevel);
        }
        ;
        if (fileLevel) {
            hubConfig.logging.fileLevel = fileLevel;
            log.config.setFileLevel(fileLevel);
        }
        ;
        ConfigUtil_1.storeHubConfig(hubConfig);
    }
    async setFileLogging(userProfile, enabled) {
        let hubConfig = ConfigUtil_1.getHubConfig();
        hubConfig.logging.fileLoggingEnabled = enabled;
        log.config.setFileLogging(enabled);
        ConfigUtil_1.storeHubConfig(hubConfig);
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
    rest_1.post('/setLogLevel', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.string('consoleLevel', { required: false })),
    tslib_1.__param(2, rest_1.param.query.string('fileLevel', { required: false })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, String]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "setLogLevel", null);
tslib_1.__decorate([
    rest_1.post('/setFileLogging', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.boolean('enabled', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Boolean]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "setFileLogging", null);
tslib_1.__decorate([
    rest_1.get('/availableLogFiles', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "availableLogFiles", null);
tslib_1.__decorate([
    rest_1.get('/downloadLogFile'),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    rest_1.oas.response.file(),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.string('filename', { required: true })),
    tslib_1.__param(2, context_1.inject(rest_1.RestBindings.Http.RESPONSE)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "downloadLogFile", null);
tslib_1.__decorate([
    rest_1.get('/deleteAllLogs', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "deleteAllLogs", null);
exports.LogController = LogController;
//# sourceMappingURL=log.controller.js.map
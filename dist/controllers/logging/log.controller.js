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
const log = Logger_1.Logger(__filename);
let AVAILABLE_LEVELS = ["none", "critical", "error", "warn", "notice", "info", "debug", "verbose", "silly"];
class LogController {
    constructor() { }
    async setLogLevel(userProfile, level) {
        if (AVAILABLE_LEVELS.indexOf(level) !== -1) {
            log.config.setLevel(level);
        }
        else {
            throw new rest_1.HttpErrors.BadRequest("Level must be one of these: " + AVAILABLE_LEVELS.join(", "));
        }
    }
    async setFileLogging(userProfile, enabled) {
        log.config.setFileLogging(enabled);
    }
    async availableLogFiles(userProfile) {
        return [];
    }
    async downloadLogFile(userProfile, filename) {
        return [];
    }
    async deleteAllLogs(userProfile) {
        return;
    }
}
tslib_1.__decorate([
    rest_1.post('/setLogLevel', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate('csAdminToken'),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.string('level', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "setLogLevel", null);
tslib_1.__decorate([
    rest_1.post('/setFileLogging', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate('csAdminToken'),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.boolean('enabled', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Boolean]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "setFileLogging", null);
tslib_1.__decorate([
    rest_1.get('/availableLogFiles', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate('csAdminToken'),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "availableLogFiles", null);
tslib_1.__decorate([
    rest_1.get('/downloadLogFile', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate('csAdminToken'),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.string('filename', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "downloadLogFile", null);
tslib_1.__decorate([
    rest_1.get('/deleteAllLogs', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate('csAdminToken'),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], LogController.prototype, "deleteAllLogs", null);
exports.LogController = LogController;
//# sourceMappingURL=log.controller.js.map
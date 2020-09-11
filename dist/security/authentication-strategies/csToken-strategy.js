"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsTokenStrategy = void 0;
const tslib_1 = require("tslib");
const rest_1 = require("@loopback/rest");
const security_1 = require("@loopback/security");
const services_1 = require("../../services");
const context_1 = require("@loopback/context");
let CsTokenStrategy = class CsTokenStrategy {
    constructor(userService) {
        this.userService = userService;
        this.name = 'csTokens';
    }
    async authenticate(request) {
        let access_token = String(request.header('access_token') ||
            request.header('Authorization') ||
            request.query.access_token);
        if (!access_token) {
            throw new rest_1.HttpErrors.Unauthorized(`Access token not found.`);
        }
        let user = await this.userService.checkAccessToken(access_token);
        let userProfile = {
            [security_1.securityId]: user.id,
            permissions: {
                switch: true
            }
        };
        return userProfile;
    }
};
CsTokenStrategy = tslib_1.__decorate([
    tslib_1.__param(0, context_1.inject('UserService')),
    tslib_1.__metadata("design:paramtypes", [services_1.UserService])
], CsTokenStrategy);
exports.CsTokenStrategy = CsTokenStrategy;
//# sourceMappingURL=csToken-strategy.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsAdminTokenStrategy = void 0;
const tslib_1 = require("tslib");
const rest_1 = require("@loopback/rest");
const security_1 = require("@loopback/security");
const services_1 = require("../../services");
const context_1 = require("@loopback/context");
const csToken_strategy_1 = require("./csToken-strategy");
let CsAdminTokenStrategy = class CsAdminTokenStrategy {
    constructor(userService) {
        this.userService = userService;
        this.name = 'csAdminToken';
    }
    async authenticate(request) {
        let access_token = csToken_strategy_1.extractToken(request);
        let user = await this.userService.checkAccessToken(access_token);
        if (user.sphereRole !== 'admin') {
            throw new rest_1.HttpErrors.Unauthorized("Admin access required.");
        }
        let userProfile = {
            [security_1.securityId]: user.id,
            permissions: {
                switch: true
            },
            sphereRole: user.sphereRole
        };
        return userProfile;
    }
};
CsAdminTokenStrategy = tslib_1.__decorate([
    tslib_1.__param(0, context_1.inject('UserService')),
    tslib_1.__metadata("design:paramtypes", [services_1.UserService])
], CsAdminTokenStrategy);
exports.CsAdminTokenStrategy = CsAdminTokenStrategy;
//# sourceMappingURL=csAdminToken-strategy.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const user_permission_model_1 = require("./user-permission.model");
let User = class User extends repository_1.Entity {
};
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "userToken", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "sphereRole", void 0);
tslib_1.__decorate([
    (0, repository_1.hasMany)(() => user_permission_model_1.UserPermission),
    tslib_1.__metadata("design:type", Array)
], User.prototype, "permissions", void 0);
User = tslib_1.__decorate([
    (0, repository_1.model)()
], User);
exports.User = User;
//# sourceMappingURL=user.model.js.map
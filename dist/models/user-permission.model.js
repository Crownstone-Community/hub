"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPermission = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const user_model_1 = require("./user.model");
let UserPermission = class UserPermission extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], UserPermission.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], UserPermission.prototype, "operation", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'boolean' }),
    tslib_1.__metadata("design:type", Boolean)
], UserPermission.prototype, "permission", void 0);
tslib_1.__decorate([
    repository_1.belongsTo(() => user_model_1.User),
    tslib_1.__metadata("design:type", String)
], UserPermission.prototype, "userId", void 0);
UserPermission = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], UserPermission);
exports.UserPermission = UserPermission;
//# sourceMappingURL=user-permission.model.js.map
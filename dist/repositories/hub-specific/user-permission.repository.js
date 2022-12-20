"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPermissionRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const user_permission_model_1 = require("../../models/hub-specific/user-permission.model");
let UserPermissionRepository = class UserPermissionRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource) {
        super(user_permission_model_1.UserPermission, datasource);
        this.datasource = datasource;
    }
};
UserPermissionRepository = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)('datasources.mongo')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource])
], UserPermissionRepository);
exports.UserPermissionRepository = UserPermissionRepository;
//# sourceMappingURL=user-permission.repository.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseDumpController = void 0;
const tslib_1 = require("tslib");
const openapi_v3_1 = require("@loopback/openapi-v3");
const DbReference_1 = require("../../crownstone/Data/DbReference");
class DatabaseDumpController {
    constructor() { }
    async dumpHubDatabase() {
        return await DbReference_1.DbRef.hub.find();
    }
    async dumpUserDatabase() {
        return await DbReference_1.DbRef.user.find();
    }
    async dumpUserPermissionsDatabase() {
        return await DbReference_1.DbRef.userPermission.find();
    }
    async dumpSphereFeatureDatabase() {
        return await DbReference_1.DbRef.sphereFeatures.find();
    }
}
tslib_1.__decorate([
    openapi_v3_1.get('/dumpHubDatabase'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], DatabaseDumpController.prototype, "dumpHubDatabase", null);
tslib_1.__decorate([
    openapi_v3_1.get('/dumpUserDatabase'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], DatabaseDumpController.prototype, "dumpUserDatabase", null);
tslib_1.__decorate([
    openapi_v3_1.get('/dumpUserPermissionsDatabase'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], DatabaseDumpController.prototype, "dumpUserPermissionsDatabase", null);
tslib_1.__decorate([
    openapi_v3_1.get('/dumpSphereFeatureDatabase'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], DatabaseDumpController.prototype, "dumpSphereFeatureDatabase", null);
exports.DatabaseDumpController = DatabaseDumpController;
//# sourceMappingURL=database-dump.controller.js.map
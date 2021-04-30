"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const asset_repository_1 = require("../repositories/cloud/asset.repository");
const asset_filter_repository_1 = require("../repositories/cloud/asset-filter.repository");
const asset_filter_set_repository_1 = require("../repositories/cloud/asset-filter-set.repository");
const authentication_1 = require("@loopback/authentication");
const Constants_1 = require("../constants/Constants");
const core_1 = require("@loopback/core");
const security_1 = require("@loopback/security");
const Filters_1 = require("../crownstone/Filters/Filters");
/**
 * This controller will echo the state of the hub.
 */
let AssetController = class AssetController {
    constructor(assetRepo, filterRepo, filterSetRepo) {
        this.assetRepo = assetRepo;
        this.filterRepo = filterRepo;
        this.filterSetRepo = filterSetRepo;
    }
    async createAsset(userProfile, newAsset) {
        return this.assetRepo.create(newAsset);
    }
    async getAllAssets(userProfile) {
        return this.assetRepo.find({});
    }
    async commitChanges(userProfile) {
        let allAssets = await this.assetRepo.find();
        let allFilters = await this.filterRepo.find();
        let changeRequired = await Filters_1.UpdateFilters(allAssets, allFilters);
        if (changeRequired) {
            // TODO: actually update the filters.
        }
    }
    async getAsset(userProfile, id) {
        return this.assetRepo.findById(id);
    }
    async updateAsset(userProfile, id, updatedModel) {
        return this.assetRepo.updateById(id, updatedModel);
    }
    async deleteAsset(userProfile, id) {
        if (!id) {
            throw new rest_1.HttpErrors.BadRequest("Invalid id");
        }
        return this.assetRepo.deleteAll({ id: id });
    }
    async deleteAllAssets(userProfile, YesImSure) {
        if (YesImSure !== 'YesImSure') {
            throw new rest_1.HttpErrors.BadRequest("YesImSure must be 'YesImSure'");
        }
        return this.assetRepo.deleteAll();
    }
};
tslib_1.__decorate([
    rest_1.post('/assets'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.requestBody({ required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AssetController.prototype, "createAsset", null);
tslib_1.__decorate([
    rest_1.get('/assets'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AssetController.prototype, "getAllAssets", null);
tslib_1.__decorate([
    rest_1.post('/assets/commit'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AssetController.prototype, "commitChanges", null);
tslib_1.__decorate([
    rest_1.get('/assets/{id}'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.path.string('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AssetController.prototype, "getAsset", null);
tslib_1.__decorate([
    rest_1.put('/assets/{id}'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.path.string('id')),
    tslib_1.__param(2, rest_1.requestBody({ required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AssetController.prototype, "updateAsset", null);
tslib_1.__decorate([
    rest_1.del('/assets/{id}'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.path.string('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AssetController.prototype, "deleteAsset", null);
tslib_1.__decorate([
    rest_1.del('/assets/all'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.string('YesImSure', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AssetController.prototype, "deleteAllAssets", null);
AssetController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(asset_repository_1.AssetRepository)),
    tslib_1.__param(1, repository_1.repository(asset_filter_repository_1.AssetFilterRepository)),
    tslib_1.__param(2, repository_1.repository(asset_filter_set_repository_1.AssetFilterSetRepository)),
    tslib_1.__metadata("design:paramtypes", [asset_repository_1.AssetRepository,
        asset_filter_repository_1.AssetFilterRepository,
        asset_filter_set_repository_1.AssetFilterSetRepository])
], AssetController);
exports.AssetController = AssetController;
//# sourceMappingURL=asset.controller.js.map
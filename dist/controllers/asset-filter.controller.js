"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetFilterController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const asset_filter_repository_1 = require("../repositories/cloud/asset-filter.repository");
const authentication_1 = require("@loopback/authentication");
const Constants_1 = require("../constants/Constants");
const core_1 = require("@loopback/core");
const security_1 = require("@loopback/security");
const asset_filter_set_repository_1 = require("../repositories/cloud/asset-filter-set.repository");
/**
 * This controller will echo the state of the hub.
 */
let AssetFilterController = class AssetFilterController {
    constructor(filterRepo, filterSetRepo) {
        this.filterRepo = filterRepo;
        this.filterSetRepo = filterSetRepo;
    }
    async getAllFilters(userProfile) {
        return this.filterRepo.find({});
    }
    async getFilter(userProfile, id) {
        return this.filterRepo.findById(id);
    }
};
tslib_1.__decorate([
    rest_1.get('/assetFilters'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AssetFilterController.prototype, "getAllFilters", null);
tslib_1.__decorate([
    rest_1.get('/assetFilters/{id}'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.path.string('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], AssetFilterController.prototype, "getFilter", null);
AssetFilterController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(asset_filter_repository_1.AssetFilterRepository)),
    tslib_1.__param(1, repository_1.repository(asset_filter_set_repository_1.AssetFilterSetRepository)),
    tslib_1.__metadata("design:paramtypes", [asset_filter_repository_1.AssetFilterRepository,
        asset_filter_set_repository_1.AssetFilterSetRepository])
], AssetFilterController);
exports.AssetFilterController = AssetFilterController;
//# sourceMappingURL=asset-filter.controller.js.map
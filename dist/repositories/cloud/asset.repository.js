"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const timestamped_crud_repository_1 = require("../bases/timestamped-crud-repository");
const asset_model_1 = require("../../models/cloud/asset.model");
let AssetRepository = class AssetRepository extends timestamped_crud_repository_1.TimestampedCrudRepository {
    constructor(datasource, filterRepoGetter) {
        super(asset_model_1.Asset, datasource);
        this.datasource = datasource;
        this.filter = this.createBelongsToAccessorFor('filter', filterRepoGetter);
    }
    async updateAll(data, where, options) {
        data.filterId = undefined;
        return super.updateAll(data, where, options);
    }
};
AssetRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__param(1, repository_1.repository.getter('FilterRepository')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource, Function])
], AssetRepository);
exports.AssetRepository = AssetRepository;
//# sourceMappingURL=asset.repository.js.map
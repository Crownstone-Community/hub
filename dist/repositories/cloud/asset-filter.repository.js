"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetFilterRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const timestamped_crud_repository_1 = require("../bases/timestamped-crud-repository");
const core_1 = require("@loopback/core");
const asset_filter_model_1 = require("../../models/cloud/asset-filter.model");
const asset_repository_1 = require("./asset.repository");
let AssetFilterRepository = class AssetFilterRepository extends timestamped_crud_repository_1.TimestampedCrudRepository {
    constructor(datasource, filterSetRepoGetter, assetRepository) {
        super(asset_filter_model_1.AssetFilter, datasource);
        this.datasource = datasource;
        this.assetRepository = assetRepository;
        this.filterSet = this.createBelongsToAccessorFor('filterSet', filterSetRepoGetter);
        this.assets = this.createHasManyRepositoryFactoryFor('assets', async () => assetRepository);
        // this.presence = this.createHasOneRepositoryFactoryFor('presence', assetPresenceRepoGetter);
        // add this line to register inclusion resolver
        this.registerInclusionResolver('assets', this.assets.inclusionResolver);
    }
};
AssetFilterRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__param(1, repository_1.repository.getter('FilterSetRepository')),
    tslib_1.__param(2, repository_1.repository(asset_repository_1.AssetRepository)),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource, Function, asset_repository_1.AssetRepository])
], AssetFilterRepository);
exports.AssetFilterRepository = AssetFilterRepository;
//# sourceMappingURL=asset-filter.repository.js.map
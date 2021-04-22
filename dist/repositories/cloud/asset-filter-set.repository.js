"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetFilterSetRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const timestamped_crud_repository_1 = require("../bases/timestamped-crud-repository");
const asset_filter_repository_1 = require("./asset-filter.repository");
const asset_filter_set_model_1 = require("../../models/cloud/asset-filter-set.model");
let AssetFilterSetRepository = class AssetFilterSetRepository extends timestamped_crud_repository_1.TimestampedCrudRepository {
    constructor(datasource, filterRepo) {
        super(asset_filter_set_model_1.AssetFilterSet, datasource);
        this.datasource = datasource;
        this.filterRepo = filterRepo;
        this.filters = this.createHasManyRepositoryFactoryFor('filters', async () => filterRepo);
        // add this line to register inclusion resolver
        this.registerInclusionResolver('filters', this.filters.inclusionResolver);
    }
};
AssetFilterSetRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__param(1, repository_1.repository(asset_filter_repository_1.AssetFilterRepository)),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource, asset_filter_repository_1.AssetFilterRepository])
], AssetFilterSetRepository);
exports.AssetFilterSetRepository = AssetFilterSetRepository;
//# sourceMappingURL=asset-filter-set.repository.js.map
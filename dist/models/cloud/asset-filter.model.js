"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetFilter = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const timestamp_mixin_1 = require("../bases/timestamp-mixin");
const base_entity_1 = require("../bases/base-entity");
const asset_model_1 = require("./asset.model");
const asset_filter_set_model_1 = require("./asset-filter-set.model");
let AssetFilter = class AssetFilter extends timestamp_mixin_1.AddTimestamps(base_entity_1.BaseEntity) {
};
tslib_1.__decorate([
    repository_1.property({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], AssetFilter.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], AssetFilter.prototype, "cloudId", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number', required: true }),
    tslib_1.__metadata("design:type", Number)
], AssetFilter.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number' }),
    tslib_1.__metadata("design:type", Number)
], AssetFilter.prototype, "idOnCrownstone", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number' }),
    tslib_1.__metadata("design:type", Number)
], AssetFilter.prototype, "profileId", void 0);
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", Object)
], AssetFilter.prototype, "inputData", void 0);
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", Object)
], AssetFilter.prototype, "outputDescription", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], AssetFilter.prototype, "data", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], AssetFilter.prototype, "dataCRC", void 0);
tslib_1.__decorate([
    repository_1.hasMany(() => asset_model_1.Asset, { keyTo: 'filterId' }),
    tslib_1.__metadata("design:type", Array)
], AssetFilter.prototype, "assets", void 0);
tslib_1.__decorate([
    repository_1.belongsTo(() => asset_filter_set_model_1.AssetFilterSet, { name: 'filterSet' }),
    tslib_1.__metadata("design:type", String)
], AssetFilter.prototype, "filterSetId", void 0);
AssetFilter = tslib_1.__decorate([
    repository_1.model()
], AssetFilter);
exports.AssetFilter = AssetFilter;
//# sourceMappingURL=asset-filter.model.js.map
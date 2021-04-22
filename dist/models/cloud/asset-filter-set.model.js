"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetFilterSet = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const timestamp_mixin_1 = require("../bases/timestamp-mixin");
const base_entity_1 = require("../bases/base-entity");
const asset_filter_model_1 = require("./asset-filter.model");
let AssetFilterSet = class AssetFilterSet extends timestamp_mixin_1.AddTimestamps(base_entity_1.BaseEntity) {
};
tslib_1.__decorate([
    repository_1.property({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], AssetFilterSet.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], AssetFilterSet.prototype, "cloudId", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number', required: true }),
    tslib_1.__metadata("design:type", Number)
], AssetFilterSet.prototype, "masterVersion", void 0);
tslib_1.__decorate([
    repository_1.hasMany(() => asset_filter_model_1.AssetFilter, { keyTo: 'filterSetId' }),
    tslib_1.__metadata("design:type", Array)
], AssetFilterSet.prototype, "filters", void 0);
AssetFilterSet = tslib_1.__decorate([
    repository_1.model()
], AssetFilterSet);
exports.AssetFilterSet = AssetFilterSet;
//# sourceMappingURL=asset-filter-set.model.js.map
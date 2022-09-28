"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const timestamp_mixin_1 = require("../bases/timestamp-mixin");
const base_entity_1 = require("../bases/base-entity");
const asset_filter_model_1 = require("./asset-filter.model");
let Asset = class Asset extends (0, timestamp_mixin_1.AddTimestamps)(base_entity_1.BaseEntity) {
};
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], Asset.prototype, "id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], Asset.prototype, "name", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], Asset.prototype, "description", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], Asset.prototype, "type", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], Asset.prototype, "cloudId", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'boolean', required: true, default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Asset.prototype, "committed", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'boolean', required: true, default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Asset.prototype, "markedForDeletion", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'number' }),
    tslib_1.__metadata("design:type", Number)
], Asset.prototype, "profileId", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'boolean', default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Asset.prototype, "exclude", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], Asset.prototype, "desiredFilterType", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ required: true }),
    tslib_1.__metadata("design:type", Object)
], Asset.prototype, "inputData", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ required: true }),
    tslib_1.__metadata("design:type", Object)
], Asset.prototype, "outputDescription", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ required: true }),
    tslib_1.__metadata("design:type", String)
], Asset.prototype, "data", void 0);
tslib_1.__decorate([
    (0, repository_1.belongsTo)(() => asset_filter_model_1.AssetFilter, { name: 'filter' }),
    tslib_1.__metadata("design:type", String)
], Asset.prototype, "filterId", void 0);
Asset = tslib_1.__decorate([
    (0, repository_1.model)()
], Asset);
exports.Asset = Asset;
//# sourceMappingURL=asset.model.js.map
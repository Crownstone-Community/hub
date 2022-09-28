"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetPresence = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const asset_model_1 = require("../asset.model");
const timestamp_mixin_1 = require("../../bases/timestamp-mixin");
const base_entity_1 = require("../../bases/base-entity");
let AssetPresence = class AssetPresence extends (0, timestamp_mixin_1.AddTimestamps)(base_entity_1.BaseEntity) {
};
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], AssetPresence.prototype, "id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'boolean', required: true }),
    tslib_1.__metadata("design:type", Boolean)
], AssetPresence.prototype, "inSphere", void 0);
tslib_1.__decorate([
    (0, repository_1.belongsTo)(() => asset_model_1.Asset),
    tslib_1.__metadata("design:type", String)
], AssetPresence.prototype, "assetId", void 0);
AssetPresence = tslib_1.__decorate([
    (0, repository_1.model)()
], AssetPresence);
exports.AssetPresence = AssetPresence;
//# sourceMappingURL=asset-presence.model.js.map
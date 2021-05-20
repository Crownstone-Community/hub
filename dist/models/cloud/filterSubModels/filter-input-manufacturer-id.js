"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterInputManufacturerId = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let FilterInputManufacturerId = class FilterInputManufacturerId extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], FilterInputManufacturerId.prototype, "type", void 0);
FilterInputManufacturerId = tslib_1.__decorate([
    repository_1.model()
], FilterInputManufacturerId);
exports.FilterInputManufacturerId = FilterInputManufacturerId;
//# sourceMappingURL=filter-input-manufacturer-id.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatFullAdData = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let FormatFullAdData = class FormatFullAdData extends repository_1.Entity {
};
tslib_1.__decorate([
    (0, repository_1.property)({ required: true }),
    tslib_1.__metadata("design:type", String)
], FormatFullAdData.prototype, "type", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'number', required: true }),
    tslib_1.__metadata("design:type", Number)
], FormatFullAdData.prototype, "adType", void 0);
FormatFullAdData = tslib_1.__decorate([
    (0, repository_1.model)()
], FormatFullAdData);
exports.FormatFullAdData = FormatFullAdData;
//# sourceMappingURL=format-full-ad-data.model.js.map
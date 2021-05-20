"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatMaskedAdData = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let FormatMaskedAdData = class FormatMaskedAdData extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], FormatMaskedAdData.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number', required: true }),
    tslib_1.__metadata("design:type", Number)
], FormatMaskedAdData.prototype, "adType", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", Number)
], FormatMaskedAdData.prototype, "mask", void 0);
FormatMaskedAdData = tslib_1.__decorate([
    repository_1.model()
], FormatMaskedAdData);
exports.FormatMaskedAdData = FormatMaskedAdData;
//# sourceMappingURL=format-masked-ad-data.model.js.map
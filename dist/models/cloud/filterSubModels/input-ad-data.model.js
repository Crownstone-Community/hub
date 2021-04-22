"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputAdData = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let InputAdData = class InputAdData extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], InputAdData.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number', required: true }),
    tslib_1.__metadata("design:type", Number)
], InputAdData.prototype, "adType", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", Number)
], InputAdData.prototype, "mask", void 0);
InputAdData = tslib_1.__decorate([
    repository_1.model()
], InputAdData);
exports.InputAdData = InputAdData;
//# sourceMappingURL=input-ad-data.model.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatMacAddress = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let FormatMacAddress = class FormatMacAddress extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], FormatMacAddress.prototype, "type", void 0);
FormatMacAddress = tslib_1.__decorate([
    repository_1.model()
], FormatMacAddress);
exports.FormatMacAddress = FormatMacAddress;
//# sourceMappingURL=format-mac-address.model.js.map
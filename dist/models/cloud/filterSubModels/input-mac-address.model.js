"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputMacAddress = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let InputMacAddress = class InputMacAddress extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], InputMacAddress.prototype, "type", void 0);
InputMacAddress = tslib_1.__decorate([
    repository_1.model()
], InputMacAddress);
exports.InputMacAddress = InputMacAddress;
//# sourceMappingURL=input-mac-address.model.js.map
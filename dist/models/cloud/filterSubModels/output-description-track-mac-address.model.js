"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputDescriptionTrackMacAddress = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let OutputDescriptionTrackMacAddress = class OutputDescriptionTrackMacAddress extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], OutputDescriptionTrackMacAddress.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], OutputDescriptionTrackMacAddress.prototype, "representation", void 0);
OutputDescriptionTrackMacAddress = tslib_1.__decorate([
    repository_1.model()
], OutputDescriptionTrackMacAddress);
exports.OutputDescriptionTrackMacAddress = OutputDescriptionTrackMacAddress;
//# sourceMappingURL=output-description-track-mac-address.model.js.map
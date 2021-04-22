"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputDescriptionTrackAdData = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let OutputDescriptionTrackAdData = class OutputDescriptionTrackAdData extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], OutputDescriptionTrackAdData.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], OutputDescriptionTrackAdData.prototype, "representation", void 0);
OutputDescriptionTrackAdData = tslib_1.__decorate([
    repository_1.model()
], OutputDescriptionTrackAdData);
exports.OutputDescriptionTrackAdData = OutputDescriptionTrackAdData;
//# sourceMappingURL=output-description-track-ad-data.model.js.map
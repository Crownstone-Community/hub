"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputDescription_shortId_track = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let OutputDescription_shortId_track = class OutputDescription_shortId_track extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], OutputDescription_shortId_track.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", Object)
], OutputDescription_shortId_track.prototype, "inputData", void 0);
OutputDescription_shortId_track = tslib_1.__decorate([
    repository_1.model()
], OutputDescription_shortId_track);
exports.OutputDescription_shortId_track = OutputDescription_shortId_track;
//# sourceMappingURL=output-description-shortId-track.model.js.map
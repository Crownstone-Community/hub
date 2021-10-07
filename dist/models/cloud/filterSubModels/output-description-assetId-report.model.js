"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputDescription_assetId_report = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let OutputDescription_assetId_report = class OutputDescription_assetId_report extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], OutputDescription_assetId_report.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", Object)
], OutputDescription_assetId_report.prototype, "inputData", void 0);
OutputDescription_assetId_report = tslib_1.__decorate([
    repository_1.model()
], OutputDescription_assetId_report);
exports.OutputDescription_assetId_report = OutputDescription_assetId_report;
//# sourceMappingURL=output-description-assetId-report.model.js.map
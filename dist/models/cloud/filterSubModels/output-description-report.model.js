"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputDescriptionReport = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let OutputDescriptionReport = class OutputDescriptionReport extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], OutputDescriptionReport.prototype, "type", void 0);
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], OutputDescriptionReport.prototype, "representation", void 0);
OutputDescriptionReport = tslib_1.__decorate([
    repository_1.model()
], OutputDescriptionReport);
exports.OutputDescriptionReport = OutputDescriptionReport;
//# sourceMappingURL=output-description-report.model.js.map
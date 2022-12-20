"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputDescription_mac_report = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let OutputDescription_mac_report = class OutputDescription_mac_report extends repository_1.Entity {
};
tslib_1.__decorate([
    (0, repository_1.property)({ required: true }),
    tslib_1.__metadata("design:type", String)
], OutputDescription_mac_report.prototype, "type", void 0);
OutputDescription_mac_report = tslib_1.__decorate([
    (0, repository_1.model)()
], OutputDescription_mac_report);
exports.OutputDescription_mac_report = OutputDescription_mac_report;
//# sourceMappingURL=output-description-mac-report.model.js.map
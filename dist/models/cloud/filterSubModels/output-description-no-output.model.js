"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputDescription_no_output = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let OutputDescription_no_output = class OutputDescription_no_output extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ required: true }),
    tslib_1.__metadata("design:type", String)
], OutputDescription_no_output.prototype, "type", void 0);
OutputDescription_no_output = tslib_1.__decorate([
    repository_1.model()
], OutputDescription_no_output);
exports.OutputDescription_no_output = OutputDescription_no_output;
//# sourceMappingURL=output-description-no-output.model.js.map
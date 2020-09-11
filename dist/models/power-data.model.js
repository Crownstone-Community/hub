"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerData = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let PowerData = class PowerData extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], PowerData.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number', required: true }),
    tslib_1.__metadata("design:type", Number)
], PowerData.prototype, "stoneUID", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number' }),
    tslib_1.__metadata("design:type", Number)
], PowerData.prototype, "powerUsage", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number' }),
    tslib_1.__metadata("design:type", Number)
], PowerData.prototype, "powerFactor", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'date' }),
    tslib_1.__metadata("design:type", Date)
], PowerData.prototype, "timestamp", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'boolean' }),
    tslib_1.__metadata("design:type", Boolean)
], PowerData.prototype, "significant", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'boolean' }),
    tslib_1.__metadata("design:type", Boolean)
], PowerData.prototype, "uploaded", void 0);
PowerData = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], PowerData);
exports.PowerData = PowerData;
//# sourceMappingURL=power-data.model.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyDataProcessed = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let EnergyDataProcessed = class EnergyDataProcessed extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], EnergyDataProcessed.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number', required: true, index: true }),
    tslib_1.__metadata("design:type", Number)
], EnergyDataProcessed.prototype, "stoneUID", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number' }),
    tslib_1.__metadata("design:type", Number)
], EnergyDataProcessed.prototype, "energyUsage", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'date', index: true }),
    tslib_1.__metadata("design:type", Date)
], EnergyDataProcessed.prototype, "timestamp", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'boolean', index: true }),
    tslib_1.__metadata("design:type", Boolean)
], EnergyDataProcessed.prototype, "uploaded", void 0);
EnergyDataProcessed = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], EnergyDataProcessed);
exports.EnergyDataProcessed = EnergyDataProcessed;
//# sourceMappingURL=energy-data-processed.model.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SphereFeature = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let SphereFeature = class SphereFeature extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], SphereFeature.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], SphereFeature.prototype, "name", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], SphereFeature.prototype, "data", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'boolean', required: true }),
    tslib_1.__metadata("design:type", Boolean)
], SphereFeature.prototype, "enabled", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'date', required: true }),
    tslib_1.__metadata("design:type", Date)
], SphereFeature.prototype, "from", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'date', required: true }),
    tslib_1.__metadata("design:type", Date)
], SphereFeature.prototype, "to", void 0);
SphereFeature = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], SphereFeature);
exports.SphereFeature = SphereFeature;
//# sourceMappingURL=sphere-feature.model.js.map
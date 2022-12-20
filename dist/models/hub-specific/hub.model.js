"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hub = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let Hub = class Hub extends repository_1.Entity {
};
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "id", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "name", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "token", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "uartKey", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "accessToken", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'date' }),
    tslib_1.__metadata("design:type", Date)
], Hub.prototype, "accessTokenExpiration", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "cloudId", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], Hub.prototype, "sphereId", void 0);
tslib_1.__decorate([
    (0, repository_1.property)({ type: 'string' }),
    tslib_1.__metadata("design:type", Object)
], Hub.prototype, "linkedStoneId", void 0);
Hub = tslib_1.__decorate([
    (0, repository_1.model)()
], Hub);
exports.Hub = Hub;
//# sourceMappingURL=hub.model.js.map
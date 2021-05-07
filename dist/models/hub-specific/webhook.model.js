"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Webhook = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let Webhook = class Webhook extends repository_1.Entity {
};
tslib_1.__decorate([
    repository_1.property({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "event", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "clientSecret", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: true }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "endPoint", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'boolean', required: true }),
    tslib_1.__metadata("design:type", Boolean)
], Webhook.prototype, "compressed", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number' }),
    tslib_1.__metadata("design:type", Number)
], Webhook.prototype, "batchTimeSeconds", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: false }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "apiKey", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'string', required: false }),
    tslib_1.__metadata("design:type", String)
], Webhook.prototype, "apiKeyHeader", void 0);
Webhook = tslib_1.__decorate([
    repository_1.model()
], Webhook);
exports.Webhook = Webhook;
//# sourceMappingURL=webhook.model.js.map
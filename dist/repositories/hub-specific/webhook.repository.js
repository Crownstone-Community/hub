"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const webhook_model_1 = require("../../models/hub-specific/webhook.model");
let WebhookRepository = class WebhookRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource) {
        super(webhook_model_1.Webhook, datasource);
        this.datasource = datasource;
    }
};
WebhookRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource])
], WebhookRepository);
exports.WebhookRepository = WebhookRepository;
//# sourceMappingURL=webhook.repository.js.map
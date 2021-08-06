"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const authentication_1 = require("@loopback/authentication");
const Constants_1 = require("../constants/Constants");
const core_1 = require("@loopback/core");
const security_1 = require("@loopback/security");
const rest_1 = require("@loopback/rest");
const webhook_model_1 = require("../models/hub-specific/webhook.model");
const webhook_repository_1 = require("../repositories/hub-specific/webhook.repository");
const CrownstoneHub_1 = require("../crownstone/CrownstoneHub");
const topics_1 = require("../crownstone/topics");
/**
 * This controller will echo the state of the hub.
 */
let WebhookController = class WebhookController {
    constructor(webhookRepo) {
        this.webhookRepo = webhookRepo;
    }
    async createWebhook(userProfile, newHook) {
        if (!newHook) {
            throw new rest_1.HttpErrors.BadRequest("Data required");
        }
        // @ts-ignore
        if (!topics_1.WebhookTopics[newHook.event]) {
            throw new rest_1.HttpErrors.BadRequest("Invalid Event. Possiblities are: " + Object.keys(topics_1.WebhookTopics).join(", "));
        }
        let hook = await this.webhookRepo.create(newHook);
        await CrownstoneHub_1.CrownstoneHub.webhooks.refreshHooks();
        return hook;
    }
    async getWebhooks(userProfile) {
        return await this.webhookRepo.find();
    }
    async deleteWebhook(userProfile, id) {
        if (!id) {
            throw new rest_1.HttpErrors.BadRequest("Invalid id");
        }
        let count = this.webhookRepo.deleteAll({ id: id });
        await CrownstoneHub_1.CrownstoneHub.webhooks.refreshHooks();
        return count;
    }
    async deleteAllAssets(userProfile, YesImSure) {
        if (YesImSure !== 'YesImSure') {
            throw new rest_1.HttpErrors.BadRequest("YesImSure must be 'YesImSure'");
        }
        let count = this.webhookRepo.deleteAll();
        await CrownstoneHub_1.CrownstoneHub.webhooks.refreshHooks();
        return count;
    }
};
tslib_1.__decorate([
    rest_1.post('/webhooks'),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.requestBody({
        required: true,
        content: {
            'application/json': {
                schema: rest_1.getModelSchemaRef(webhook_model_1.Webhook, {
                    title: 'NewWebhook',
                    exclude: ['id'],
                }),
            },
        },
        description: "Create a webhook that will invoke an endpoint on certain event triggers."
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "createWebhook", null);
tslib_1.__decorate([
    rest_1.get('/webhooks'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "getWebhooks", null);
tslib_1.__decorate([
    rest_1.del('/webhooks/{id}'),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.path.string('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "deleteWebhook", null);
tslib_1.__decorate([
    rest_1.del('/webhooks/all'),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, core_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.string('YesImSure', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, String]),
    tslib_1.__metadata("design:returntype", Promise)
], WebhookController.prototype, "deleteAllAssets", null);
WebhookController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(webhook_repository_1.WebhookRepository)),
    tslib_1.__metadata("design:paramtypes", [webhook_repository_1.WebhookRepository])
], WebhookController);
exports.WebhookController = WebhookController;
//# sourceMappingURL=webhook.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const hub_repository_1 = require("../repositories/hub-specific/hub.repository");
const repositories_1 = require("../repositories");
const HubStatus_1 = require("../crownstone/HubStatus");
const application_1 = require("../application");
const CrownstoneUtil_1 = require("../crownstone/CrownstoneUtil");
const HubEventBus_1 = require("../crownstone/HubEventBus");
const models_1 = require("../models");
const crownstone_cloud_1 = require("crownstone-cloud");
const topics_1 = require("../crownstone/topics");
const Constants_1 = require("../constants/Constants");
const authentication_1 = require("@loopback/authentication");
/**
 * This controller will echo the state of the hub.
 */
let HubController = class HubController {
    constructor(hubRepo, userRepo) {
        this.hubRepo = hubRepo;
        this.userRepo = userRepo;
    }
    async createHub(newHub) {
        if (await this.hubRepo.isSet() === false) {
            let cloud = new crownstone_cloud_1.CrownstoneCloud({ customCloudAddress: process.env.CLOUD_V1_URL, customCloudV2Address: process.env.CLOUD_V2_URL });
            if (!(newHub.cloudId && newHub.token)) {
                throw new rest_1.HttpErrors.BadRequest("CloudId and token are mandatory.");
            }
            try {
                await cloud.hubLogin(newHub.cloudId, newHub.token);
            }
            catch (e) {
                if (e && e.statusCode === 401) {
                    throw new rest_1.HttpErrors.BadRequest("Invalid token/cloudId combination.");
                }
            }
            return this.hubRepo.create(newHub)
                .then(() => {
                HubEventBus_1.eventBus.emit(topics_1.topics.HUB_CREATED);
            });
        }
        else {
            throw new rest_1.HttpErrors.Forbidden("Hub already created and initialized.");
        }
    }
    async delete(YesImSure) {
        if (YesImSure !== 'YesImSure') {
            throw new rest_1.HttpErrors.BadRequest("YesImSure must be 'YesImSure'");
        }
        return await CrownstoneUtil_1.CrownstoneUtil.deleteCrownstoneHub(true);
    }
    reboot() {
        // since the hub is launched as a service, any crash will be restarted.
        process.exit();
    }
    async deleteEverything(YesImSure) {
        if (YesImSure !== 'YesImSure') {
            throw new rest_1.HttpErrors.BadRequest("YesImSure must be 'YesImSure'");
        }
        return await CrownstoneUtil_1.CrownstoneUtil.deleteCrownstoneHub(false);
    }
    async getHubStatus() {
        if (await this.hubRepo.isSet() === false) {
            throw new rest_1.HttpErrors.NotFound("No hub configured.");
        }
        return { ...HubStatus_1.HubStatus, uptime: Math.round((Date.now() - application_1.BOOT_TIME) * 0.001) };
    }
};
tslib_1.__decorate([
    (0, rest_1.post)('/hub'),
    tslib_1.__param(0, (0, rest_1.requestBody)({
        content: { 'application/json': { schema: (0, rest_1.getModelSchemaRef)(models_1.Hub, { title: 'newHub', exclude: ['id', 'uartKey', 'accessToken', 'accessTokenExpiration'] }) } },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], HubController.prototype, "createHub", null);
tslib_1.__decorate([
    (0, rest_1.del)('/hub/'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, rest_1.param.query.string('YesImSure', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], HubController.prototype, "delete", null);
tslib_1.__decorate([
    (0, rest_1.post)('hub/reboot'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], HubController.prototype, "reboot", null);
tslib_1.__decorate([
    (0, rest_1.del)('/hub/everything'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, rest_1.param.query.string('YesImSure', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], HubController.prototype, "deleteEverything", null);
tslib_1.__decorate([
    (0, rest_1.get)('/hubStatus'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], HubController.prototype, "getHubStatus", null);
HubController = tslib_1.__decorate([
    tslib_1.__param(0, (0, repository_1.repository)(hub_repository_1.HubRepository)),
    tslib_1.__param(1, (0, repository_1.repository)(repositories_1.UserRepository)),
    tslib_1.__metadata("design:paramtypes", [hub_repository_1.HubRepository,
        repositories_1.UserRepository])
], HubController);
exports.HubController = HubController;
//# sourceMappingURL=hub.controller.js.map
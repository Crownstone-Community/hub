"use strict";
// Uncomment these imports to begin using these cool features!
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubController = void 0;
const tslib_1 = require("tslib");
// import {inject} from '@loopback/context';
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const hub_repository_1 = require("../repositories/hub.repository");
const HubEventBus_1 = require("../crownstone/HubEventBus");
const topics_1 = require("../crownstone/topics");
const repositories_1 = require("../repositories");
const CrownstoneHub_1 = require("../crownstone/CrownstoneHub");
const HubStatus_1 = require("../crownstone/HubStatus");
const application_1 = require("../application");
/**
 * This controller will echo the state of the hub.
 */
let HubController = class HubController {
    constructor(hubRepo, userRepo) {
        this.hubRepo = hubRepo;
        this.userRepo = userRepo;
    }
    // @post('/hub')
    // async createHub(
    //   @requestBody({
    //     content: {'application/json': { schema: getModelSchemaRef(Hub, { title: 'newHub', exclude: ['id','uartKey','accessToken','accessTokenExpiration'] })}},
    //   })
    //   newHub: DataObject<Hub>,
    // ): Promise<void> {
    //   if (await this.hubRepo.isSet() === false) {
    //     let cloud = new CrownstoneCloud();
    //     if (!(newHub.cloudId && newHub.token)) {
    //       throw new HttpErrors.BadRequest("CloudId and token are mandatory.");
    //     }
    //     try {
    //       await cloud.hubLogin(newHub.cloudId, newHub.token);
    //     }
    //     catch (e) {
    //       if (e && e.statusCode === 401) {
    //         throw new HttpErrors.BadRequest("Invalid token/cloudId combination.");
    //       }
    //     }
    //     return this.hubRepo.create(newHub)
    //       .then(() => {
    //         eventBus.emit(topics.HUB_CREATED);
    //       })
    //   }
    //   else {
    //     throw new HttpErrors.Forbidden("Hub already created and initialized.");
    //   }
    // }
    // @post('/uartKey')
    // @authenticate(SecurityTypes.admin)
    // async setUartKey(
    //   @param.query.string('uartKey', {required:true}) uartKey: string,
    // ): Promise<void> {
    //   let currentHub = await this.hubRepo.get()
    //   if (currentHub === null) {
    //     throw new HttpErrors.NotFound("No hub configured.");
    //   }
    //   else {
    //     if (uartKey.length !== 32) {
    //       throw new HttpErrors.BadRequest("UART key should be a hexstring key of 32 characters.");
    //     }
    //     currentHub.uartKey = uartKey;
    //     return this.hubRepo.update(currentHub)
    //       .then(() => {
    //         eventBus.emit(topics.HUB_UART_KEY_UPDATED);
    //       })
    //   }
    // }
    // @patch('/hub')
    // @authenticate(SecurityTypes.admin)
    // async updateHub(
    //   @requestBody({
    //     content: {'application/json': { schema: getModelSchemaRef(Hub, { title: 'newHub', exclude: ['id','uartKey','accessToken','accessTokenExpiration'] })}},
    //   })
    //     editedHub: DataObject<Hub>,
    // ): Promise<void> {
    //   let currentHub = await this.hubRepo.get()
    //   if (currentHub === null) {
    //
    //
    //     return this.hubRepo.create(editedHub)
    //       .then(() => {
    //         eventBus.emit(topics.HUB_CREATED);
    //       })
    //   }
    //   else {
    //     if (editedHub.cloudId) { currentHub.cloudId = editedHub.cloudId; }
    //     if (editedHub.name)    { currentHub.name    = editedHub.name;    }
    //     if (editedHub.token)   { currentHub.token   = editedHub.token;   }
    //
    //     return this.hubRepo.update(currentHub)
    //       .then(() => {
    //         eventBus.emit(topics.HUB_CREATED);
    //       })
    //   }
    // }
    // @authenticate(SecurityTypes.admin)
    async delete(YesImSure) {
        if (YesImSure !== 'YesImSure') {
            throw new rest_1.HttpErrors.BadRequest("YesImSure must be 'YesImSure'");
        }
        if (await this.hubRepo.isSet() === true) {
            HubStatus_1.resetHubStatus();
            HubEventBus_1.eventBus.emit(topics_1.topics.HUB_DELETED);
            await CrownstoneHub_1.CrownstoneHub.cleanupAndDestroy();
            return "Success.";
        }
        else {
            throw new rest_1.HttpErrors.NotFound("No Hub to delete..");
        }
    }
    async getHubSatus() {
        let currentHub = await this.hubRepo.get();
        if (currentHub === null) {
            throw new rest_1.HttpErrors.NotFound("No hub configured.");
        }
        return { ...HubStatus_1.HubStatus, uptime: Math.round((Date.now() - application_1.BOOT_TIME) * 0.001) };
    }
};
tslib_1.__decorate([
    rest_1.del('/hub'),
    tslib_1.__param(0, rest_1.param.query.string('YesImSure', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], HubController.prototype, "delete", null);
tslib_1.__decorate([
    rest_1.get('/hubStatus'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], HubController.prototype, "getHubSatus", null);
HubController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(hub_repository_1.HubRepository)),
    tslib_1.__param(1, repository_1.repository(repositories_1.UserRepository)),
    tslib_1.__metadata("design:paramtypes", [hub_repository_1.HubRepository,
        repositories_1.UserRepository])
], HubController);
exports.HubController = HubController;
//# sourceMappingURL=hub.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const hub_model_1 = require("../../models/hub-specific/hub.model");
const DbUtil_1 = require("../../crownstone/data/DbUtil");
let HubRepository = class HubRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource) {
        super(hub_model_1.Hub, datasource);
        this.datasource = datasource;
    }
    async create(entity, options) {
        if (await this.isSet() === false) {
            if (await this.isSphereSet()) {
                let partialHub = await this.get();
                if (partialHub) {
                    // casting to string here is important because mongo Ids are not strings...
                    if (String(entity.sphereId) !== String(partialHub?.sphereId)) {
                        await DbUtil_1.EMPTY_DATABASE();
                    }
                    else {
                        await this.delete(partialHub);
                    }
                }
                else {
                    await DbUtil_1.EMPTY_DATABASE();
                }
            }
            return super.create(entity, options);
        }
        throw "Hub is already registered.";
    }
    async isSphereSet() {
        let hub = await this.get();
        if (hub?.sphereId) {
            return true;
        }
        return false;
    }
    async isSet() {
        let hub = await this.get();
        if (hub && hub.cloudId && hub.cloudId !== 'null') {
            return true;
        }
        return false;
    }
    async get() {
        let hub = await this.findOne();
        return hub;
    }
    async partialDelete() {
        let hub = await this.findOne();
        if (hub) {
            hub.token = '';
            hub.cloudId = '';
            hub.name = '';
            hub.uartKey = '';
            hub.accessToken = '';
            hub.accessTokenExpiration = new Date(0);
            hub.linkedStoneId = '';
            await this.update(hub);
        }
    }
};
HubRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource])
], HubRepository);
exports.HubRepository = HubRepository;
//# sourceMappingURL=hub.repository.js.map
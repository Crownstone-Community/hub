"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const hub_model_1 = require("../models/hub.model");
const DbReference_1 = require("../crownstone/Data/DbReference");
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
                    if (entity.sphereId !== (partialHub === null || partialHub === void 0 ? void 0 : partialHub.sphereId)) {
                        await DbReference_1.EMPTY_DATABASE();
                    }
                    else {
                        await this.delete(partialHub);
                    }
                }
                else {
                    await DbReference_1.EMPTY_DATABASE();
                }
            }
            return super.create(entity, options);
        }
        throw "Hub is already registered.";
    }
    async isSphereSet() {
        let hub = await this.get();
        if (hub === null || hub === void 0 ? void 0 : hub.sphereId) {
            return true;
        }
        return false;
    }
    async isSet() {
        let hub = await this.get();
        if (hub && hub.id !== 'null') {
            return true;
        }
        return false;
    }
    async get() {
        let hub = await this.findOne();
        return hub;
    }
};
HubRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource])
], HubRepository);
exports.HubRepository = HubRepository;
//# sourceMappingURL=hub.repository.js.map
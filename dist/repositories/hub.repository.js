"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const hub_model_1 = require("../models/hub.model");
let HubRepository = class HubRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource) {
        super(hub_model_1.Hub, datasource);
        this.datasource = datasource;
    }
    async create(entity, options) {
        if (await this.isSet() === false) {
            return super.create(entity, options);
        }
        throw "Hub is already registered.";
    }
    async isSet() {
        let hubs = await this.find();
        return hubs.length > 0;
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
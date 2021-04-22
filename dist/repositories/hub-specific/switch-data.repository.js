"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchDataRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const switch_data_model_1 = require("../../models/hub-specific/switch-data.model");
let SwitchDataRepository = class SwitchDataRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource) {
        super(switch_data_model_1.SwitchData, datasource);
        this.datasource = datasource;
    }
};
SwitchDataRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource])
], SwitchDataRepository);
exports.SwitchDataRepository = SwitchDataRepository;
//# sourceMappingURL=switch-data.repository.js.map
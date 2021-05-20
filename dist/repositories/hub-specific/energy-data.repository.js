"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyDataRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const energy_data_model_1 = require("../../models/hub-specific/energy-data.model");
let EnergyDataRepository = class EnergyDataRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource) {
        super(energy_data_model_1.EnergyData, datasource);
        this.datasource = datasource;
        this.datasource.autoupdate();
    }
};
EnergyDataRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource])
], EnergyDataRepository);
exports.EnergyDataRepository = EnergyDataRepository;
//# sourceMappingURL=energy-data.repository.js.map
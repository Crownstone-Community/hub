"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerDataRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const power_data_model_1 = require("../../models/hub-specific/power-data.model");
let PowerDataRepository = class PowerDataRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource) {
        super(power_data_model_1.PowerData, datasource);
        this.datasource = datasource;
    }
};
PowerDataRepository = tslib_1.__decorate([
    tslib_1.__param(0, (0, core_1.inject)('datasources.mongo')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource])
], PowerDataRepository);
exports.PowerDataRepository = PowerDataRepository;
//# sourceMappingURL=power-data.repository.js.map
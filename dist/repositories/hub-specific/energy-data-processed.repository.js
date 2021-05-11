"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyDataProcessedRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const models_1 = require("../../models");
let EnergyDataProcessedRepository = class EnergyDataProcessedRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource) {
        super(models_1.EnergyDataProcessed, datasource);
        this.datasource = datasource;
        this.datasource.autoupdate();
    }
    async getStoneUIDs() {
        let collection = this.dataSource.connector?.collection("EnergyDataProcessed");
        if (collection && collection.distinct) {
            let uids = await collection.distinct('stoneUID');
            return uids;
        }
        else if (collection) { // this is use for unit testing.
            return [1];
        }
        else {
            return [];
        }
    }
};
EnergyDataProcessedRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource])
], EnergyDataProcessedRepository);
exports.EnergyDataProcessedRepository = EnergyDataProcessedRepository;
//# sourceMappingURL=energy-data-processed.repository.js.map
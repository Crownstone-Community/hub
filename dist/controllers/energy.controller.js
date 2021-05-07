"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyController = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const repositories_1 = require("../repositories");
const authentication_1 = require("@loopback/authentication");
const context_1 = require("@loopback/context");
const security_1 = require("@loopback/security");
const Constants_1 = require("../constants/Constants");
const MemoryDb_1 = require("../crownstone/data/MemoryDb");
const IntervalData_1 = require("../crownstone/processing/IntervalData");
/**
 * This controller will echo the state of the hub.
 */
let EnergyController = class EnergyController {
    constructor(energyDataProcessedRepo, energyDataRepo) {
        this.energyDataProcessedRepo = energyDataProcessedRepo;
        this.energyDataRepo = energyDataRepo;
    }
    async getEnergyAvailability(userProfile) {
        var _a;
        let collection = (_a = this.energyDataProcessedRepo.dataSource.connector) === null || _a === void 0 ? void 0 : _a.collection("EnergyDataProcessed");
        if (collection) {
            let result = [];
            let uids = await collection.distinct('stoneUID');
            for (let i = 0; i < uids.length; i++) {
                let data = MemoryDb_1.fillWithStoneData(uids[i]);
                data.count = 0;
                if (data.cloudId) {
                    let countData = await this.energyDataProcessedRepo.count({ stoneUID: uids[i], interval: '1m' });
                    if (countData) {
                        data.count = countData.count;
                    }
                    result.push(data);
                }
            }
            return result;
        }
        throw new rest_1.HttpErrors.InternalServerError("Could not get distinct list");
    }
    async getEnergyData(userProfile, crownstoneUID, from, until, limit, interval) {
        let useInterval = '1m';
        if (interval === '1m' || IntervalData_1.IntervalData[interval] !== undefined) {
            useInterval = interval;
        }
        let filters = [{ stoneUID: crownstoneUID, interval: useInterval }];
        if (from) {
            filters.push({ timestamp: { gte: from } });
        }
        if (until) {
            filters.push({ timestamp: { lte: until } });
        }
        let query = { where: { and: filters }, limit: limit, fields: { energyUsage: true, timestamp: true }, order: 'timestamp ASC' };
        // @ts-ignore
        return await this.energyDataProcessedRepo.find(query);
    }
    async deleteStoneEnergy(userProfile, crownstoneUID, from, until) {
        let filters = [{ stoneUID: crownstoneUID }];
        if (from) {
            filters.push({ timestamp: { gte: from } });
        }
        if (until) {
            filters.push({ timestamp: { lte: until } });
        }
        let query = { and: filters };
        let deleteCountRaw = await this.energyDataRepo.deleteAll(query);
        let deleteCountProcessed = await this.energyDataProcessedRepo.deleteAll(query);
        return deleteCountProcessed;
    }
    async deleteAllEnergyData(userProfile, from, until) {
        let filters = [];
        if (from) {
            filters.push({ timestamp: { gte: from } });
        }
        if (until) {
            filters.push({ timestamp: { lte: until } });
        }
        let query = { and: filters };
        let deleteCountRaw = await this.energyDataRepo.deleteAll(query);
        let deleteCountProcessed = await this.energyDataProcessedRepo.deleteAll(query);
        return deleteCountProcessed;
    }
};
tslib_1.__decorate([
    rest_1.get('/energyAvailability'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], EnergyController.prototype, "getEnergyAvailability", null);
tslib_1.__decorate([
    rest_1.get('/energyRange'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.number('crownstoneUID', { required: true })),
    tslib_1.__param(2, rest_1.param.query.dateTime('from', { required: false })),
    tslib_1.__param(3, rest_1.param.query.dateTime('until', { required: false })),
    tslib_1.__param(4, rest_1.param.query.number('limit', { required: true })),
    tslib_1.__param(5, rest_1.param.query.string('interval', { required: false })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Number, Date,
        Date, Number, String]),
    tslib_1.__metadata("design:returntype", Promise)
], EnergyController.prototype, "getEnergyData", null);
tslib_1.__decorate([
    rest_1.del('/energyFromCrownstone'),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.number('crownstoneUID', { required: true })),
    tslib_1.__param(2, rest_1.param.query.dateTime('from', { required: false })),
    tslib_1.__param(3, rest_1.param.query.dateTime('until', { required: false })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Number, Date,
        Date]),
    tslib_1.__metadata("design:returntype", Promise)
], EnergyController.prototype, "deleteStoneEnergy", null);
tslib_1.__decorate([
    rest_1.del('/energyData'),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.dateTime('from', { required: false })),
    tslib_1.__param(2, rest_1.param.query.dateTime('until', { required: false })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Date,
        Date]),
    tslib_1.__metadata("design:returntype", Promise)
], EnergyController.prototype, "deleteAllEnergyData", null);
EnergyController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.EnergyDataProcessedRepository)),
    tslib_1.__param(1, repository_1.repository(repositories_1.EnergyDataRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.EnergyDataProcessedRepository,
        repositories_1.EnergyDataRepository])
], EnergyController);
exports.EnergyController = EnergyController;
//# sourceMappingURL=energy.controller.js.map
"use strict";
// Uncomment these imports to begin using these cool features!
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyController = void 0;
const tslib_1 = require("tslib");
// import {inject} from '@loopback/context';
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const repositories_1 = require("../repositories");
const authentication_1 = require("@loopback/authentication");
const context_1 = require("@loopback/context");
const security_1 = require("@loopback/security");
/**
 * This controller will echo the state of the hub.
 */
let EnergyController = class EnergyController {
    constructor(energyDataProcessedRepo) {
        this.energyDataProcessedRepo = energyDataProcessedRepo;
    }
    async getEnergyData(userProfile, crownstoneUID, from, until, limit) {
        let filters = [{ stoneUID: crownstoneUID }];
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
    async getEnergyAvailability(userProfile) {
        var _a;
        let collection = (_a = this.energyDataProcessedRepo.dataSource.connector) === null || _a === void 0 ? void 0 : _a.collection("EnergyDataProcessed");
        if (collection) {
            let result = [];
            let uids = await collection.distinct('stoneUID');
            for (let i = 0; i < uids.length; i++) {
                let count = await this.energyDataProcessedRepo.count({ stoneUID: uids[i] });
                result.push({ crownstoneUID: uids[i], count: count.count });
            }
            return result;
        }
        throw new rest_1.HttpErrors.InternalServerError("Could not get distinct list");
    }
    async deleteStoneEnergy(userProfile, crownstoneUID) {
        return this.energyDataProcessedRepo.deleteAll({ stoneUID: crownstoneUID });
    }
    async deleteAllEnergyData(userProfile) {
        return this.energyDataProcessedRepo.deleteAll({});
    }
};
tslib_1.__decorate([
    rest_1.get('/energyRange'),
    authentication_1.authenticate('csToken'),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.number('crownstoneUID', { required: true })),
    tslib_1.__param(2, rest_1.param.query.dateTime('from', { required: false })),
    tslib_1.__param(3, rest_1.param.query.dateTime('until', { required: false })),
    tslib_1.__param(4, rest_1.param.query.number('limit', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Number, Date,
        Date, Number]),
    tslib_1.__metadata("design:returntype", Promise)
], EnergyController.prototype, "getEnergyData", null);
tslib_1.__decorate([
    rest_1.get('/energyAvailability'),
    authentication_1.authenticate('csToken'),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], EnergyController.prototype, "getEnergyAvailability", null);
tslib_1.__decorate([
    rest_1.del('/energyFromCrownstone'),
    authentication_1.authenticate('csAdminToken'),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.number('crownstoneUID', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Number]),
    tslib_1.__metadata("design:returntype", Promise)
], EnergyController.prototype, "deleteStoneEnergy", null);
tslib_1.__decorate([
    rest_1.del('/energyData'),
    authentication_1.authenticate('csAdminToken'),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], EnergyController.prototype, "deleteAllEnergyData", null);
EnergyController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.EnergyDataProcessedRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.EnergyDataProcessedRepository])
], EnergyController);
exports.EnergyController = EnergyController;
//# sourceMappingURL=energy.controller.js.map
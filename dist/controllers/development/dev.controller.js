"use strict";
// Uncomment these imports to begin using these cool features!
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevController = void 0;
const tslib_1 = require("tslib");
// import {inject} from '@loopback/context';
const rest_1 = require("@loopback/rest");
const authentication_1 = require("@loopback/authentication");
const context_1 = require("@loopback/context");
const security_1 = require("@loopback/security");
const Constants_1 = require("../../constants/Constants");
const repository_1 = require("@loopback/repository");
const repositories_1 = require("../../repositories");
const CrownstoneHub_1 = require("../../crownstone/CrownstoneHub");
let DevController = class DevController {
    constructor(energyDataProcessedRepo, energyDataRepo) {
        this.energyDataProcessedRepo = energyDataProcessedRepo;
        this.energyDataRepo = energyDataRepo;
    }
    async getRawEnergyData(userProfile, crownstoneUID, from, until, limit) {
        let filters = [{ stoneUID: crownstoneUID }];
        if (from) {
            filters.push({ timestamp: { gte: from } });
        }
        if (until) {
            filters.push({ timestamp: { lte: until } });
        }
        let query = { where: { and: filters }, limit: limit, order: 'timestamp ASC' };
        // @ts-ignore
        return await this.energyDataRepo.find(query);
    }
    async reprocessEnergyData(userProfile) {
        if (CrownstoneHub_1.CrownstoneHub.mesh.energy.energyIsProcessing) {
            throw new rest_1.HttpErrors.PreconditionFailed("Energy is being processed at the moment. Please try again later.");
        }
        CrownstoneHub_1.CrownstoneHub.mesh.energy.pauseProcessing(120);
        await this.energyDataProcessedRepo.deleteAll();
        await this.energyDataRepo.updateAll({ processed: false });
        setTimeout(() => {
            CrownstoneHub_1.CrownstoneHub.mesh.energy.processMeasurements();
            CrownstoneHub_1.CrownstoneHub.mesh.energy.resumeProcessing();
        });
    }
    async reprocessingStatus(userProfile) {
        if (CrownstoneHub_1.CrownstoneHub.mesh.energy.energyIsProcessing) {
            let totalCount = await this.energyDataRepo.count();
            let processedCount = await this.energyDataRepo.count({ processed: true });
            return {
                status: "IN_PROGRESS",
                percentage: 100 * (processedCount.count / totalCount.count)
            };
        }
        else {
            return {
                status: "FINISHED",
                percentage: 100
            };
        }
    }
};
tslib_1.__decorate([
    rest_1.get('/rawEnergyRange'),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.number('crownstoneUID', { required: true })),
    tslib_1.__param(2, rest_1.param.query.dateTime('from', { required: false })),
    tslib_1.__param(3, rest_1.param.query.dateTime('until', { required: false })),
    tslib_1.__param(4, rest_1.param.query.number('limit', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Number, Date,
        Date, Number]),
    tslib_1.__metadata("design:returntype", Promise)
], DevController.prototype, "getRawEnergyData", null);
tslib_1.__decorate([
    rest_1.get('/reprocessEnergyData'),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], DevController.prototype, "reprocessEnergyData", null);
tslib_1.__decorate([
    rest_1.get('/reprocessingStatus'),
    authentication_1.authenticate(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], DevController.prototype, "reprocessingStatus", null);
DevController = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.EnergyDataProcessedRepository)),
    tslib_1.__param(1, repository_1.repository(repositories_1.EnergyDataRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.EnergyDataProcessedRepository,
        repositories_1.EnergyDataRepository])
], DevController);
exports.DevController = DevController;
//# sourceMappingURL=dev.controller.js.map
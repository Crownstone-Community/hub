"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevController = void 0;
const tslib_1 = require("tslib");
const rest_1 = require("@loopback/rest");
const authentication_1 = require("@loopback/authentication");
const context_1 = require("@loopback/context");
const security_1 = require("@loopback/security");
const Constants_1 = require("../../constants/Constants");
const repository_1 = require("@loopback/repository");
const repositories_1 = require("../../repositories");
const CrownstoneHub_1 = require("../../crownstone/CrownstoneHub");
const Logger_1 = require("../../Logger");
const ConfigUtil_1 = require("../../util/ConfigUtil");
const log = (0, Logger_1.Logger)(__filename);
const DeveloperOptionsSchema = {
    type: 'object',
    properties: {
        actOnSwitchCommands: { type: 'boolean' }
    }
};
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
        if (CrownstoneHub_1.CrownstoneHub.mesh.energy.energyIsAggregating) {
            throw new rest_1.HttpErrors.PreconditionFailed("Energy is being aggregated at the moment. Please try again later.");
        }
        if (CrownstoneHub_1.CrownstoneHub.mesh.energy.aggregationProcessingPaused) {
            throw new rest_1.HttpErrors.PreconditionFailed("Energy is being aggregated at the moment. Please try again later. Currently clearing database...");
        }
        CrownstoneHub_1.CrownstoneHub.mesh.energy.pauseProcessing(36000);
        await this.energyDataProcessedRepo.deleteAll();
        await this.energyDataRepo.updateAll({ processed: false });
        setTimeout(async () => {
            await CrownstoneHub_1.CrownstoneHub.mesh.energy.processMeasurements(true);
            CrownstoneHub_1.CrownstoneHub.mesh.energy.resumeProcessing();
        });
    }
    async reprocessEnergyAggregates(userProfile) {
        log.debug("Invoked reprocessEnergyAggregates!");
        if (CrownstoneHub_1.CrownstoneHub.mesh.energy.energyIsProcessing) {
            throw new rest_1.HttpErrors.PreconditionFailed("Energy is being processed at the moment. Please try again later.");
        }
        if (CrownstoneHub_1.CrownstoneHub.mesh.energy.energyIsAggregating) {
            throw new rest_1.HttpErrors.PreconditionFailed("Energy is being aggregated at the moment. Please try again later.");
        }
        if (CrownstoneHub_1.CrownstoneHub.mesh.energy.aggregationProcessingPaused) {
            throw new rest_1.HttpErrors.PreconditionFailed("Energy is being aggregated at the moment. Please try again later. Currently clearing database...");
        }
        CrownstoneHub_1.CrownstoneHub.mesh.energy.pauseAggregationProcessing(36000);
        log.debug("Deleting all aggregated items...");
        let count = await this.energyDataProcessedRepo.deleteAll({ interval: { neq: '1m' } });
        log.debug("Deleting all aggregated items... DONE", count);
        log.debug("Checking how many entries are left:");
        let remainderCount5m = await this.energyDataProcessedRepo.count({ interval: '5m' });
        let remainderCount10m = await this.energyDataProcessedRepo.count({ interval: '10m' });
        let remainderCount15m = await this.energyDataProcessedRepo.count({ interval: '15m' });
        let remainderCount30m = await this.energyDataProcessedRepo.count({ interval: '30m' });
        let remainderCount1h = await this.energyDataProcessedRepo.count({ interval: '1h' });
        let remainderCount3h = await this.energyDataProcessedRepo.count({ interval: '3h' });
        let remainderCount6h = await this.energyDataProcessedRepo.count({ interval: '6h' });
        let remainderCount12h = await this.energyDataProcessedRepo.count({ interval: '12h' });
        let remainderCount1d = await this.energyDataProcessedRepo.count({ interval: '1d' });
        let remainderCount1w = await this.energyDataProcessedRepo.count({ interval: '1w' });
        log.debug("All counts:", "\n5m", remainderCount5m, "\n10m", remainderCount10m, "\n15m", remainderCount15m, "\n30m", remainderCount30m, "\n1h", remainderCount1h, "\n3h", remainderCount3h, "\n6h", remainderCount6h, "\n12h", remainderCount12h, "\n1d", remainderCount1d, "\n1w", remainderCount1w);
        setTimeout(async () => {
            await CrownstoneHub_1.CrownstoneHub.mesh.energy.processAggregations(true);
            CrownstoneHub_1.CrownstoneHub.mesh.energy.resumeAggregationProcessing();
        }, 1000);
        return count;
    }
    async reprocessEnergyDataStatus(userProfile) {
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
    async reprocessEnergyAggregatesStatus(userProfile) {
        if (CrownstoneHub_1.CrownstoneHub.mesh.energy.energyIsAggregating) {
            let totalCount = await this.energyDataProcessedRepo.count({ interval: '1m' });
            let processedCount = await this.energyDataProcessedRepo.count({ interval: { neq: '1m' } });
            let assumedFactor = 1 / 5 + 1 / 10 + 1 / 15 + 1 / 30 + 1 / 60 + 1 / (3 * 60) + 1 / (6 * 60) + 1 / (12 * 60) + 1 / (24 * 60) + 1 / (7 * 24 * 60);
            let expectedCount = totalCount.count * assumedFactor;
            return {
                status: "IN_PROGRESS",
                percentage: 100 * (processedCount.count / expectedCount)
            };
        }
        else {
            return {
                status: "FINISHED",
                percentage: 100
            };
        }
    }
    async getDeveloperOptions(userProfile) {
        let hubConfig = (0, ConfigUtil_1.getHubConfig)();
        return hubConfig.developerOptions;
    }
    async putDeveloperOptions(userProfile, devOptions) {
        let hubConfig = (0, ConfigUtil_1.getHubConfig)();
        hubConfig.developerOptions = devOptions;
        (0, ConfigUtil_1.storeHubConfig)(hubConfig);
    }
};
tslib_1.__decorate([
    (0, rest_1.get)('/rawEnergyRange'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
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
    (0, rest_1.post)('/reprocessEnergyData'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], DevController.prototype, "reprocessEnergyData", null);
tslib_1.__decorate([
    (0, rest_1.post)('/reprocessEnergyAggregates'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], DevController.prototype, "reprocessEnergyAggregates", null);
tslib_1.__decorate([
    (0, rest_1.get)('/reprocessEnergyDataStatus'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], DevController.prototype, "reprocessEnergyDataStatus", null);
tslib_1.__decorate([
    (0, rest_1.get)('/reprocessEnergyAggregatesStatus'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], DevController.prototype, "reprocessEnergyAggregatesStatus", null);
tslib_1.__decorate([
    (0, rest_1.get)('/developerOptions'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], DevController.prototype, "getDeveloperOptions", null);
tslib_1.__decorate([
    (0, rest_1.post)('/developerOptions'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.admin),
    tslib_1.__param(0, (0, context_1.inject)(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, (0, rest_1.requestBody)({
        content: { 'application/json': { schema: DeveloperOptionsSchema } },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], DevController.prototype, "putDeveloperOptions", null);
DevController = tslib_1.__decorate([
    tslib_1.__param(0, (0, repository_1.repository)(repositories_1.EnergyDataProcessedRepository)),
    tslib_1.__param(1, (0, repository_1.repository)(repositories_1.EnergyDataRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.EnergyDataProcessedRepository,
        repositories_1.EnergyDataRepository])
], DevController);
exports.DevController = DevController;
//# sourceMappingURL=dev.controller.js.map
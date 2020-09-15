"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SphereFeatureRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const sphere_feature_model_1 = require("../models/sphere-feature.model");
let SphereFeatureRepository = class SphereFeatureRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource) {
        super(sphere_feature_model_1.SphereFeature, datasource);
        this.datasource = datasource;
    }
};
SphereFeatureRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource])
], SphereFeatureRepository);
exports.SphereFeatureRepository = SphereFeatureRepository;
//# sourceMappingURL=sphere-feature.repository.js.map
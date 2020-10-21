"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseInfoRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const database_info_model_1 = require("../models/database-info.model");
let DatabaseInfoRepository = class DatabaseInfoRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource) {
        super(database_info_model_1.DatabaseInfo, datasource);
        this.datasource = datasource;
        this.datasource.autoupdate();
    }
};
DatabaseInfoRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource])
], DatabaseInfoRepository);
exports.DatabaseInfoRepository = DatabaseInfoRepository;
//# sourceMappingURL=database-info.repository.js.map
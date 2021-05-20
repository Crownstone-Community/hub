"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestampedCrudRepository = void 0;
const repository_1 = require("@loopback/repository");
const config_1 = require("../../config");
const CloudUtil_1 = require("../../util/CloudUtil");
class TimestampedCrudRepository extends repository_1.DefaultCrudRepository {
    async create(entity, options) {
        this.__handleId(entity);
        this.__updateTimes(entity);
        return super.create(entity, options);
    }
    async createAll(entities, options) {
        for (let i = 0; i < entities.length; i++) {
            this.__handleId(entities[i]);
            this.__updateTimes(entities[i], options);
        }
        return super.createAll(entities, options);
    }
    async updateAll(data, where, options) {
        if (!options || options.acceptTimes !== true) {
            data.updatedAt = CloudUtil_1.CloudUtil.getDate();
        }
        return super.updateAll(data, where, options);
    }
    async replaceById(id, data, options) {
        data.updatedAt = CloudUtil_1.CloudUtil.getDate();
        return super.replaceById(id, data, options);
    }
    __handleId(entity) {
        if (config_1.CONFIG.generateCustomIds) {
            // @ts-ignore
            entity.id = CloudUtil_1.CloudUtil.createId(this.constructor.name);
        }
    }
    __updateTimes(entity, options) {
        entity.createdAt = CloudUtil_1.CloudUtil.getDate();
        entity.updatedAt = entity.updatedAt ?? CloudUtil_1.CloudUtil.getDate();
    }
}
exports.TimestampedCrudRepository = TimestampedCrudRepository;
//# sourceMappingURL=timestamped-crud-repository.js.map
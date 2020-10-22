"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseInfo = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let DatabaseInfo = class DatabaseInfo extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], DatabaseInfo.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number', required: true }),
    tslib_1.__metadata("design:type", Number)
], DatabaseInfo.prototype, "version", void 0);
DatabaseInfo = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], DatabaseInfo);
exports.DatabaseInfo = DatabaseInfo;
//# sourceMappingURL=database-info.model.js.map
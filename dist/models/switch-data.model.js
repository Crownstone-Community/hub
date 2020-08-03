"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchData = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let SwitchData = class SwitchData extends repository_1.Entity {
    constructor(data) {
        super(data);
    }
};
tslib_1.__decorate([
    repository_1.property({ type: 'string', id: true }),
    tslib_1.__metadata("design:type", String)
], SwitchData.prototype, "id", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number', required: true }),
    tslib_1.__metadata("design:type", Number)
], SwitchData.prototype, "stoneUID", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'number' }),
    tslib_1.__metadata("design:type", Number)
], SwitchData.prototype, "switchState", void 0);
tslib_1.__decorate([
    repository_1.property({ type: 'date' }),
    tslib_1.__metadata("design:type", Date)
], SwitchData.prototype, "timestamp", void 0);
SwitchData = tslib_1.__decorate([
    repository_1.model(),
    tslib_1.__metadata("design:paramtypes", [Object])
], SwitchData);
exports.SwitchData = SwitchData;
//# sourceMappingURL=switch-data.model.js.map
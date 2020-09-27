"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchController = void 0;
const tslib_1 = require("tslib");
const rest_1 = require("@loopback/rest");
const dist_1 = require("@loopback/rest/dist");
const ReturnCodes_1 = require("./returnCodes/ReturnCodes");
const authentication_1 = require("@loopback/authentication");
const context_1 = require("@loopback/context");
const security_1 = require("@loopback/security");
const CrownstoneHub_1 = require("../crownstone/CrownstoneHub");
const Constants_1 = require("../constants/Constants");
const SwitchDataSchema = {
    oneOf: [
        {
            type: 'object',
            required: ['type', 'crownstoneId'],
            properties: {
                type: { type: 'TURN_ON' },
                crownstoneId: { type: 'number' },
                value: { type: 'null' }
            }
        },
        {
            type: 'object',
            required: ['type', 'crownstoneId'],
            properties: {
                type: { type: 'TURN_OFF' },
                crownstoneId: { type: 'number' },
                value: { type: 'null' }
            }
        },
        {
            type: 'object',
            required: ['type', 'crownstoneId', 'value'],
            properties: {
                type: { type: "DIMMING" },
                crownstoneId: { type: 'number' },
                value: { type: 'number' }
            }
        }
    ]
};
class SwitchController {
    constructor() { }
    async turnOn(userProfile, crownstoneUID) {
        await CrownstoneHub_1.CrownstoneHub.uart.switchCrownstones([{ type: "TURN_ON", stoneId: crownstoneUID }]);
    }
    async turnOff(userProfile, crownstoneUID) {
        await CrownstoneHub_1.CrownstoneHub.uart.switchCrownstones([{ type: "TURN_OFF", stoneId: crownstoneUID }]);
    }
    async dim(userProfile, crownstoneUID, switchState) {
        if (switchState < 0 || switchState > 0 && switchState <= 1 || switchState > 100) {
            throw new dist_1.HttpErrors.UnprocessableEntity("Switch state must be between 0 and 100.");
        }
        await CrownstoneHub_1.CrownstoneHub.uart.switchCrownstones([{ type: "PERCENTAGE", stoneId: crownstoneUID, percentage: switchState }]);
    }
    async switchCrownstones(userProfile, switchData) {
        await CrownstoneHub_1.CrownstoneHub.uart.switchCrownstones(switchData);
    }
}
tslib_1.__decorate([
    rest_1.post('/turnOn', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.number('crownstoneUID', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Number]),
    tslib_1.__metadata("design:returntype", Promise)
], SwitchController.prototype, "turnOn", null);
tslib_1.__decorate([
    rest_1.post('/turnOff', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.number('crownstoneUID', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Number]),
    tslib_1.__metadata("design:returntype", Promise)
], SwitchController.prototype, "turnOff", null);
tslib_1.__decorate([
    rest_1.post('/switch', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.param.query.number('crownstoneUID', { required: true })),
    tslib_1.__param(2, rest_1.param.query.number('switchState', { required: true })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Number, Number]),
    tslib_1.__metadata("design:returntype", Promise)
], SwitchController.prototype, "dim", null);
tslib_1.__decorate([
    rest_1.post('/switchMultiple', ReturnCodes_1.EmptyReturnCode),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__param(0, context_1.inject(security_1.SecurityBindings.USER)),
    tslib_1.__param(1, rest_1.requestBody({
        content: { 'application/json': { schema: SwitchDataSchema } },
    })),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Array]),
    tslib_1.__metadata("design:returntype", Promise)
], SwitchController.prototype, "switchCrownstones", null);
exports.SwitchController = SwitchController;
//# sourceMappingURL=switch.controller.js.map
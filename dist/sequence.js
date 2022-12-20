"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrownstoneSequence = void 0;
const tslib_1 = require("tslib");
const context_1 = require("@loopback/context");
const rest_1 = require("@loopback/rest");
const authentication_1 = require("@loopback/authentication");
const SequenceActions = rest_1.RestBindings.SequenceActions;
let CrownstoneSequence = class CrownstoneSequence {
    constructor(findRoute, parseParams, authenticateRequest, invoke, send, reject) {
        this.findRoute = findRoute;
        this.parseParams = parseParams;
        this.authenticateRequest = authenticateRequest;
        this.invoke = invoke;
        this.send = send;
        this.reject = reject;
    }
    async handle(context) {
        try {
            const { request, response } = context;
            const route = this.findRoute(request);
            //call authentication action
            await this.authenticateRequest(request);
            const args = await this.parseParams(request, route);
            const result = await this.invoke(route, args);
            this.send(response, result);
        }
        catch (err) {
            if (err.code === authentication_1.AUTHENTICATION_STRATEGY_NOT_FOUND || err.code === authentication_1.USER_PROFILE_NOT_FOUND) {
                Object.assign(err, { statusCode: 401 /* Unauthorized */ });
            }
            this.reject(context, err);
        }
    }
};
CrownstoneSequence = tslib_1.__decorate([
    tslib_1.__param(0, (0, context_1.inject)(SequenceActions.FIND_ROUTE)),
    tslib_1.__param(1, (0, context_1.inject)(SequenceActions.PARSE_PARAMS)),
    tslib_1.__param(2, (0, context_1.inject)(authentication_1.AuthenticationBindings.AUTH_ACTION)),
    tslib_1.__param(3, (0, context_1.inject)(SequenceActions.INVOKE_METHOD)),
    tslib_1.__param(4, (0, context_1.inject)(SequenceActions.SEND)),
    tslib_1.__param(5, (0, context_1.inject)(SequenceActions.REJECT)),
    tslib_1.__metadata("design:paramtypes", [Function, Function, Function, Function, Function, Function])
], CrownstoneSequence);
exports.CrownstoneSequence = CrownstoneSequence;
//# sourceMappingURL=sequence.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRequestData = exports.parseHubSetup = void 0;
function parseHubSetup(dataRef, stepper) {
    try {
        let tokenLength = stepper.getUInt16();
        let tokenBuffer = stepper.getBuffer(tokenLength);
        let token = tokenBuffer.toString();
        let cloudIdLength = stepper.getUInt16();
        let cloudIdBuffer = stepper.getBuffer(cloudIdLength);
        let cloudId = cloudIdBuffer.toString();
        dataRef.result = { type: dataRef.dataType, token, cloudId };
    }
    catch (e) {
        dataRef.valid = false;
    }
}
exports.parseHubSetup = parseHubSetup;
function parseRequestData(dataRef, stepper) {
    try {
        let requestedType = stepper.getUInt16();
        dataRef.result = { type: dataRef.dataType, requestedType: requestedType };
    }
    catch (e) {
        dataRef.valid = false;
    }
}
exports.parseRequestData = parseRequestData;
//# sourceMappingURL=HubDataParsers.js.map
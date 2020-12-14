"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubDataReplyData = exports.HubDataReplyString = exports.HubDataReplySuccess = exports.HubDataReplyError = void 0;
const crownstone_core_1 = require("crownstone-core");
const HubProtocol_1 = require("../HubProtocol");
const PROTOCOL_VERSION = 0;
const PREFIX_SIZE = 5;
function HubDataReplyError(type, message = '') {
    let headerBuffer = new crownstone_core_1.DataWriter(PREFIX_SIZE + 2); // 5 * prefix + 2
    headerBuffer.putUInt16(crownstone_core_1.ResultValue.SUCCESS);
    headerBuffer.putUInt16(HubProtocol_1.HubReplyCode.ERROR);
    headerBuffer.putUInt8(PROTOCOL_VERSION);
    headerBuffer.putUInt16(type);
    let stringBuffer = Buffer.from(message, 'ascii');
    let result = Buffer.concat([headerBuffer.getBuffer(), stringBuffer]);
    if (result.length > 100) {
        throw "GENERATED_HUB_REPLY_TOO_LONG";
    }
    return result;
}
exports.HubDataReplyError = HubDataReplyError;
function HubDataReplySuccess(data) {
    let headerBuffer = new crownstone_core_1.DataWriter(PREFIX_SIZE + 2); // 2 (connection protocol) + 3 (prefix) + 4 (data)
    headerBuffer.putUInt16(crownstone_core_1.ResultValue.SUCCESS); // This is the required value of the connection protocol
    headerBuffer.putUInt8(PROTOCOL_VERSION);
    headerBuffer.putUInt16(HubProtocol_1.HubReplyCode.SUCCESS); // SUCCESS CODE
    let result = headerBuffer.getBuffer();
    if (result.length > 100) {
        throw "GENERATED_HUB_REPLY_TOO_LONG";
    }
    return result;
}
exports.HubDataReplySuccess = HubDataReplySuccess;
function HubDataReplyString(requestedDataType, data) {
    let stringBuffer = Buffer.from(data, 'ascii');
    return HubDataReplyData(requestedDataType, stringBuffer);
}
exports.HubDataReplyString = HubDataReplyString;
function HubDataReplyData(requestedDataType, data) {
    let headerBuffer = new crownstone_core_1.DataWriter(PREFIX_SIZE + 2); // 5 + 2 + N bytes
    headerBuffer.putUInt16(crownstone_core_1.ResultValue.SUCCESS);
    headerBuffer.putUInt8(PROTOCOL_VERSION);
    headerBuffer.putUInt16(HubProtocol_1.HubReplyCode.DATA_REPLY);
    headerBuffer.putUInt16(requestedDataType);
    let result = Buffer.concat([headerBuffer.getBuffer(), data]);
    if (result.length > 100) {
        throw "GENERATED_HUB_REPLY_TOO_LONG";
    }
    return result;
}
exports.HubDataReplyData = HubDataReplyData;
//# sourceMappingURL=HubDataReply.js.map
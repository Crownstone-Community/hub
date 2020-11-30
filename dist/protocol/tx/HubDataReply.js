"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubDataReplyData = exports.HubDataReplyString = exports.HubDataReplySuccess = exports.HubDataReplyError = void 0;
const crownstone_core_1 = require("crownstone-core");
const HubProtocol_1 = require("../HubProtocol");
const PROTOCOL_VERSION = 0;
function HubDataReplyError(type, message = '') {
    let headerBuffer = new crownstone_core_1.DataWriter(9); // 2 +3 + 4
    headerBuffer.putUInt16(crownstone_core_1.ResultValue.SUCCESS);
    headerBuffer.putUInt8(PROTOCOL_VERSION);
    headerBuffer.putUInt16(HubProtocol_1.HubReplyCode.ERROR);
    let stringBuffer = Buffer.from(message, 'ascii');
    let messageLength = stringBuffer.length;
    headerBuffer.putUInt16(messageLength);
    let result = Buffer.concat([headerBuffer.getBuffer(), stringBuffer]);
    if (result.length > 100) {
        throw "GENERATED_HUB_REPLY_TOO_LONG";
    }
    return result;
}
exports.HubDataReplyError = HubDataReplyError;
function HubDataReplySuccess(data) {
    let headerBuffer = new crownstone_core_1.DataWriter(7); // 2 (uart protocol) + 3 (prefix) + 4 (data)
    headerBuffer.putUInt16(crownstone_core_1.ResultValue.SUCCESS); // This is the required value of the uart protocol
    headerBuffer.putUInt8(PROTOCOL_VERSION);
    headerBuffer.putUInt16(HubProtocol_1.HubReplyCode.SUCCESS); // SUCCESS CODE
    let messageLength = 0;
    headerBuffer.putUInt16(messageLength);
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
    let headerBuffer = new crownstone_core_1.DataWriter(9); // 5 + 2 + 2 (length) + N bytes
    headerBuffer.putUInt16(crownstone_core_1.ResultValue.SUCCESS);
    headerBuffer.putUInt8(PROTOCOL_VERSION);
    headerBuffer.putUInt16(HubProtocol_1.HubReplyCode.DATA_REPLY);
    headerBuffer.putUInt16(requestedDataType);
    let messageLength = data.length;
    headerBuffer.putUInt16(messageLength);
    let result = Buffer.concat([headerBuffer.getBuffer(), data]);
    if (result.length > 100) {
        throw "GENERATED_HUB_REPLY_TOO_LONG";
    }
    return result;
}
exports.HubDataReplyData = HubDataReplyData;
//# sourceMappingURL=HubDataReply.js.map
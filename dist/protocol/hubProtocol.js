"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubRequestDataType = exports.HubReplyCode = exports.HubReplyError = exports.HubDataType = void 0;
exports.HubDataType = {
    SETUP: 0,
    COMMAND: 1,
    FACTORY_RESET: 2,
    FACTORY_RESET_HUB_ONLY: 3,
    REQUEST_DATA: 10,
};
exports.HubReplyError = {
    NOT_IN_SETUP_MODE: 0,
    IN_SETUP_MODE: 1,
    INVALID_TOKEN: 2,
    UNKNOWN: 60000,
};
exports.HubReplyCode = {
    SUCCESS: 0,
    DATA_REPLY: 10,
    ERROR: 4000
};
exports.HubRequestDataType = {
    CLOUD_ID: 0
};
//# sourceMappingURL=hubProtocol.js.map
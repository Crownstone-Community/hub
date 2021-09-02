"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookInternalTopics = exports.WebhookTopics = exports.topics = void 0;
exports.topics = {
    CLOUD_SYNC_REQUIRED: "CLOUD_SYNC_REQUIRED",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    CLOUD_AUTHENTICATION_PROBLEM_401: "CLOUD_AUTHENTICATION_PROBLEM_401",
    HUB_CREATED: "HUB_CREATED",
    HUB_DELETED: "HUB_DELETED",
    HUB_UART_KEY_UPDATED: "HUB_UART_KEY_UPDATED",
    MESH_SERVICE_DATA: "MESH_SERVICE_DATA",
    MESH_TOPOLOGY: "MESH_TOPOLOGY",
    HUB_CONFIG_UPDATED: "HUB_CONFIG_UPDATED"
};
exports.WebhookTopics = {
    ASSET_REPORT: "ASSET_REPORT",
    ASSET_TRACKING: "ASSET_TRACKING",
};
exports.WebhookInternalTopics = {
    __ASSET_REPORT: "__ASSET_REPORT",
    __ASSET_TRACKING_UPDATE: "__ASSET_TRACKING_UPDATE",
    __ASSET_TRACKING_TIMEOUT: "__ASSET_TRACKING_TIMEOUT",
};
//# sourceMappingURL=topics.js.map
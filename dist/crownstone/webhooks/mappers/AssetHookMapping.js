"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookMapAssetReportCompressedData = exports.webhookMapAssetReportData = void 0;
const MemoryDb_1 = require("../../data/MemoryDb");
function webhookMapAssetReportData(data) {
    return {
        type: "ASSET_MAC_REPORT",
        crownstoneId: data.crownstoneId,
        crownstoneMacAddress: getMacAddress(data.crownstoneId),
        assetMacAddress: data.macAddress,
        assetRssi: data.rssi,
        rssiChannel: data.channel,
        timestamp: Date.now(),
    };
}
exports.webhookMapAssetReportData = webhookMapAssetReportData;
function webhookMapAssetReportCompressedData(data) {
    return {
        i: data.crownstoneId,
        cm: getMacAddress(data.crownstoneId),
        am: data.macAddress,
        r: data.rssi,
        c: data.channel,
        t: Date.now(),
    };
}
exports.webhookMapAssetReportCompressedData = webhookMapAssetReportCompressedData;
function getMacAddress(crownstoneId) {
    let stone = MemoryDb_1.MemoryDb.stones[crownstoneId];
    if (stone) {
        return stone.macAddress;
    }
    return null;
}
//# sourceMappingURL=AssetHookMapping.js.map
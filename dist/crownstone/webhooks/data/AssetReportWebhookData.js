"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMacAddressFromCrownstoneId = exports.AssetReportWebhookData = void 0;
const MemoryDb_1 = require("../../data/MemoryDb");
class AssetReportWebhookData {
    constructor(data) {
        this.crownstoneId = data.crownstoneId;
        this.crownstoneMacAddress = getMacAddressFromCrownstoneId(data.crownstoneId);
        this.assetMacAddress = data.macAddress;
        this.assetRssi = data.rssi;
        this.rssiChannel = data.channel;
        this.timestamp = Date.now();
    }
    getData() {
        return {
            crownstoneId: this.crownstoneId,
            crownstoneMacAddress: this.crownstoneMacAddress,
            assetMacAddress: this.assetMacAddress,
            assetRssi: this.assetRssi,
            rssiChannel: this.rssiChannel,
            timestamp: this.timestamp,
        };
    }
    getCompressedData() {
        return {
            cid: this.crownstoneId,
            cm: this.crownstoneMacAddress,
            am: this.assetMacAddress,
            r: this.assetRssi,
            c: this.rssiChannel,
            t: this.timestamp,
        };
    }
}
exports.AssetReportWebhookData = AssetReportWebhookData;
function getMacAddressFromCrownstoneId(crownstoneId) {
    let stone = MemoryDb_1.MemoryDb.stones[crownstoneId];
    if (stone) {
        return stone.macAddress;
    }
    return null;
}
exports.getMacAddressFromCrownstoneId = getMacAddressFromCrownstoneId;
//# sourceMappingURL=AssetReportWebhookData.js.map
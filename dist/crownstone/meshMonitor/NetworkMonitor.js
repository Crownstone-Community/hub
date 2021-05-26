"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkMonitor = void 0;
class NetworkMonitor {
    constructor() {
        this.crownstonesInMesh = {};
        this.topology = {};
    }
    updateLastSeen(crownstoneId) {
        this.crownstonesInMesh[crownstoneId] = Date.now();
    }
    updateTopology(data) {
        let lookupId = this._getLookupId(data);
        this.topology[lookupId] = {
            from: data.senderId,
            to: data.receiverId,
            lastSeen: Date.now() - data.lastSeen * 1000,
            rssi: {
                37: data.rssi37,
                38: data.rssi38,
                39: data.rssi39
            }
        };
    }
    resetTopology() {
        this.topology = {};
        this.crownstonesInMesh = {};
    }
    _getLookupId(data) {
        return `${data.senderId}-${data.receiverId}`;
    }
}
exports.NetworkMonitor = NetworkMonitor;
//# sourceMappingURL=NetworkMonitor.js.map
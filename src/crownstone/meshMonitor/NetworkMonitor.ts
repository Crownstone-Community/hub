

export class NetworkMonitor {

  crownstonesInMesh : { [stoneUID : string] : number } = {};
  topology : { [lookupId: string]: Edge } = {};

  updateLastSeen(crownstoneId: number) {
    this.crownstonesInMesh[crownstoneId] = Date.now();
  }

  updateTopology(data: TopologyUpdateData) {
    let lookupId = this._getLookupId(data);
    this.topology[lookupId] = {
      from:     data.senderId,
      to:       data.receiverId,
      lastSeen: Date.now() - data.lastSeen*1000,
      rssi: {
        37: data.rssi37,
        38: data.rssi38,
        39: data.rssi39
      }
    }
  }

  resetTopology() {
    this.topology = {};
    this.crownstonesInMesh = {};
  }

  _getLookupId(data: TopologyUpdateData) {
    return `${data.senderId}-${data.receiverId}`;
  }
}


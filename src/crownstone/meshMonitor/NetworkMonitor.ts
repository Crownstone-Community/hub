

export class NetworkMonitor {

  crownstonesInMesh : { [stoneUID : string] : number } = {};
  topology : { [lookupId: string]: Edge }

  updateLastSeen(crownstoneId: number) {
    this.crownstonesInMesh[crownstoneId] = Date.now();
  }

  updateTopology(data: TopologyUpdateData) {
    let lookupId = this._getLookupId(data);
    if (this.topology[lookupId] === undefined) {
      this.topology[lookupId] = {
        from:     data.senderId,
        to:       data.receiverId,
        lastSeen: Date.now() - data.lastSeen*1000,
        rssi: {
          37: data.rssi37,
          38: data.rssi38,
          39: data.rssi39
        },
        history: [],
      }
    }
    else {
      this.topology[lookupId].history.unshift({
        rssi:     this.topology[lookupId].rssi,
        lastSeen: this.topology[lookupId].lastSeen
      });

      this.topology[lookupId].rssi     = {37: data.rssi37, 38: data.rssi38, 39: data.rssi39};
      this.topology[lookupId].lastSeen = Date.now() - data.lastSeen*1000;

      // do not keep more data than 100 previous measurements.
      if (this.topology[lookupId].history.length > 100) {
        this.topology[lookupId].history.pop();
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


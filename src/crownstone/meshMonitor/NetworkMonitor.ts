

export class NetworkMonitor {

  crownstonesInMesh : { [stoneUID : string] : number }         = {};
  lossStatistics    : { [stoneUID : string] : LossStatistics } = {};
  topology          : { [lookupId: string]  : Edge }           = {};

  updateLastSeen(crownstoneId: number) {
    this.crownstonesInMesh[crownstoneId] = Date.now();
  }

  updateTopology(data: TopologyUpdateData) {
    let lookupId = this._getLookupId(data);
    let lastMessageNumber = data.messageNumber;
    let received = 0;
    let lost = 0;

    // Keep track of the amount of lost packets.
    if (this.lossStatistics[data.receiverId] !== undefined) {
      lastMessageNumber = this.lossStatistics[data.receiverId].messageNumber;
      received = this.lossStatistics[data.receiverId].received;
      lost = this.lossStatistics[data.receiverId].lost;
      let missed = getMissedMessageCount(data.messageNumber, lastMessageNumber);

      // 50 is too large of a gap. If the connection is so bad we'd actually get 1 in 50 messages, a uint8 counter is not
      // sufficient to monitor this.
      if (missed > 50) {
        received = 0;
        lost = 0;
      }
      else {
        lost += missed;
      }
    }

    // update the statistics
    this.lossStatistics[data.receiverId] = {
      lastUpdate: Date.now(),
      messageNumber: data.messageNumber,
      received: received++,
      lost: lost
    }

    // update the topology
    this.topology[lookupId] = {
      from:     data.senderId,
      to:       data.receiverId,
      lastSeen: Date.now() - data.lastSeen*1000,
      rssi: {
        37: data.rssi37,
        38: data.rssi38,
        39: data.rssi39
      },
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

function getMissedMessageCount(currentIndex: number, lastIndex: number) : number {
  let countSize = 256;
  let expected = (lastIndex + 1) % countSize;

  if (currentIndex === expected) {
    return 0;
  }
  else if (currentIndex > expected) {
    return expected - currentIndex;
  }
  else { // if (currentIndex < expected) {
    // we have overflown? Check if the expected is at the upper half
    return currentIndex + countSize - expected;
  }
}


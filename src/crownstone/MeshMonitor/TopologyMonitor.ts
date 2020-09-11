

export class TopologyMonitor {

  crownstonesInMesh : { [stoneUid : number] : number } = {};

  collect(crownstoneId: number) {
    this.crownstonesInMesh[crownstoneId] = Date.now();
  }

}
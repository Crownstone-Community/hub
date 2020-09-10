

export class TopologyMonitor {

  crownstonesInMesh : { [stoneUid : number] : boolean } = {};

  collect(crownstoneId: number) {
    this.crownstonesInMesh[crownstoneId] = true
  }

}
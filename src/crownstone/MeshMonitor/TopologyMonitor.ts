

export class TopologyMonitor {

  crownstonesInMesh : { [stoneUID : string] : number } = {};

  collect(crownstoneId: number) {
    this.crownstonesInMesh[crownstoneId] = Date.now();
  }

}
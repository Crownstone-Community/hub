
interface Crownstone {
  name: string,
  uid: number,
  cloudId: string,
}

class MemoryDbClass {
  stones: Crownstone[];

  loadCloudStoneData( stoneData: CloudStoneData[] ) {
    console.log("TODO: Map data", stoneData)
  }
}

export const MemoryDb = new MemoryDbClass()
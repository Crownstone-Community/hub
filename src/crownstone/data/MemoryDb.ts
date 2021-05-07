interface Crownstone {
  name: string,
  uid: number,
  macAddress: string,
  switchState: number | null,
  locked: boolean,
  dimming: boolean,
  switchcraft: boolean,
  tapToToggle: boolean,
  cloudId: string,
  locationCloudId: string,
  updatedAt: number,
}

interface Location {
  name: string,
  uid:  number,
  icon: string,
  cloudId: string,
  updatedAt: number
}

class MemoryDbClass {
  // the key of the stones is the UID, the short-uint8 id.
  stones:    {[shortUid: string]: Crownstone } = {};

  // the key of the locations is the UID, the short-uint8 id.
  locations: {[shortUid: string]: Location } = {};

  // the key of the locations is the cloudId, the mongo id.
  locationByCloudId: {[cloudId: string]: Location}

  loadCloudLocationData( locationData: cloud_Location[] ) {
    let usedUIDs : map = {};
    Object.keys(this.stones).forEach((uid: string) => { usedUIDs[uid] = false; });


    // load cloud data into local data store
    locationData.forEach((cloudLocation) => {
      let uid = cloudLocation.uid;
      let cloudDataUpdateTime = new Date(cloudLocation.updatedAt).valueOf();
      usedUIDs[uid] = true;
      if (this.locations[uid] === undefined) {
        this.locations[uid] = {
          name:        cloudLocation.name,
          uid:         cloudLocation.uid,
          icon:        cloudLocation.icon,
          cloudId:     cloudLocation.id,
          updatedAt:   cloudDataUpdateTime,
        }
      }
      else {
        if (this.locations[uid].updatedAt < cloudDataUpdateTime) {
          this.locations[uid].name =      cloudLocation.name;
          this.locations[uid].uid =       cloudLocation.uid;
          this.locations[uid].icon =      cloudLocation.icon;
          this.locations[uid].cloudId =   cloudLocation.id;
          this.locations[uid].updatedAt = cloudDataUpdateTime;
        }
      }
    })

    // cleanup
    Object.keys(usedUIDs).forEach((uid) => {
      if (usedUIDs[uid] === false) {
        delete this.locations[uid];
      }
    });

    // fill the cloudId map
    this.locationByCloudId = {};
    Object.keys(this.locations).forEach((uid) => {
      let location = this.locations[uid];
      this.locationByCloudId[location.cloudId] = location;
    })
  }

  loadCloudStoneData( stoneData: cloud_Stone[] ) {
    let usedUIDs : map = {};
    Object.keys(this.stones).forEach((uid: string) => { usedUIDs[uid] = false; });


    // load cloud data into local data store
    stoneData.forEach((cloudStone) => {
      let uid = cloudStone.uid;
      let cloudDataUpdateTime = new Date(cloudStone.updatedAt).valueOf();
      usedUIDs[uid] = true;
      if (this.stones[uid] === undefined) {
        this.stones[uid] = {
          name:            cloudStone.name,
          uid:             cloudStone.uid,
          macAddress:      cloudStone.address,
          locked:          cloudStone.locked,
          locationCloudId: cloudStone.locationId,
          cloudId:         cloudStone.id,
          updatedAt:       cloudDataUpdateTime,
          switchState:     null,
          switchcraft:     getAbilityData("switchcraft", cloudStone.abilities),
          dimming:         getAbilityData("dimming",     cloudStone.abilities),
          tapToToggle:     getAbilityData("tapToToggle", cloudStone.abilities),
        }
      }
      else {
        if (this.stones[uid].updatedAt < cloudDataUpdateTime) {
          this.stones[uid].name            = cloudStone.name;
          this.stones[uid].uid             = cloudStone.uid;
          this.stones[uid].locked          = cloudStone.locked;
          this.stones[uid].cloudId         = cloudStone.id;
          this.stones[uid].locationCloudId = cloudStone.locationId;
          this.stones[uid].updatedAt       = cloudDataUpdateTime;
        }
        this.stones[uid].switchcraft = getAbilityData("switchcraft", cloudStone.abilities, this.stones[uid])
        this.stones[uid].dimming     = getAbilityData("dimming",     cloudStone.abilities, this.stones[uid])
        this.stones[uid].tapToToggle = getAbilityData("tapToToggle", cloudStone.abilities, this.stones[uid])
      }
    })

    // cleanup
    Object.keys(usedUIDs).forEach((uid) => {
      if (usedUIDs[uid] === false) {
        delete this.stones[uid];
      }
    })
  }
}

function getAbilityData(type: AbilityType, abilities?: cloud_Ability[], stoneItem?: Crownstone) : boolean {
  if (abilities) {
    for (let i = 0; i < abilities.length; i++) {
      let ability = abilities[i];
      if (ability.type === type) {
        if (stoneItem) {
          if (stoneItem.updatedAt < new Date(ability.updatedAt).valueOf()) {
            return ability.enabled;
          }
          else {
            return stoneItem[type];
          }
        }
        else {
          return ability.enabled;
        }
      }
    }
  }
  return false;
}



export function fillWithStoneData(uid : number | string) : {
  uid:                 number,
  name:                string | null,
  cloudId:             string | null,
  locationName:        string | null,
} {
  let object : any = {};
  let stone  = MemoryDb.stones[uid];
  if (!stone) {
    object.name = null;
    object.locationName = null;
    object.uid = Number(uid);
    object.cloudId = null;
    return object;
  }
  let locationName = MemoryDb.locationByCloudId[stone.locationCloudId]?.name || null;

  object.name = stone.name;
  object.locationName = locationName;
  object.uid = Number(uid);
  object.cloudId = stone.cloudId;
    
  return object;
}

export function getStoneIdFromMacAdddress(macAddress:string) {
  let mac = macAddress.toUpperCase();
  for (const [key, value] of Object.entries(MemoryDb.stones)) {
    if (value.macAddress.toUpperCase() === mac) {
      return value.cloudId;
    }
  }
  return null;
}


export const MemoryDb = new MemoryDbClass()
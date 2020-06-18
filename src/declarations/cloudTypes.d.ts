interface CloudStoneData {
  name: string,
  address: string,
  type: string,
  major: number,
  minor: number,
  uid: number,
  icon: string,
  firmwareVersion: string,
  bootloaderVersion: string,
  hardwareVersion: string,
  hidden: boolean,
  locked: boolean,
  id: string,
  locationId: string,
  sphereId: string,
  createdAt: string,
  updatedAt: string,
  currentPowerUsageId: string,
  currentSwitchStateId: string,
  locations: LocationData[],
  abilities:  AbilityData[]
}
interface AbilityData {
  type: "dimming" | "switchcraft" | "tapToToggle",
  enabled: boolean,
  syncedToCrownstone: boolean,
  id: string,
  stoneId: string,
  sphereId: string,
  createdAt: string,
  updatedAt: string,
  properties: AbilityPropertyData[]
}
interface AbilityPropertyData {
  type: "softOnSpeed" | "rssiOffset",
  value: string,
  id: string,
  abilityId: string,
  sphereId:  string,
  createdAt: string,
  updatedAt: string,
}

interface LocationData {
  name: string,
  uid: number,
  icon: string,
  imageId: string,
  id: string,
  sphereId: string,
  createdAt: string,
  updatedAt: string,
}
interface BehaviourData {
  type: string,
  data: string,
  idOnCrownstone: number,
  profileIndex: number,
  syncedToCrownstone: boolean,
  deleted: boolean,
  activeDays: {
    Mon: boolean,
    Tue: boolean,
    Wed: boolean,
    Thu: boolean,
    Fri: boolean,
    Sat: boolean,
    Sun: boolean
  },
  id: string,
  stoneId: string,
  sphereId: string,
  createdAt: string,
  updatedAt: string,
}

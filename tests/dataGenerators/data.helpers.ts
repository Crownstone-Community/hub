

export function generateServiceData(crownstoneUID, switchState, powerUsageReal, accumulatedEnergy, timestamp) {
  return {
    crownstoneId              : crownstoneUID,
    switchState               : switchState,
    powerFactor               : 1,
    powerUsageReal            : powerUsageReal,
    powerUsageApparent        : powerUsageReal,
    accumulatedEnergy         : accumulatedEnergy,
    timestamp                 : timestamp,
    uniqueElement             : timestamp,
    timeIsSet                 : true,
  }
}

export function getEvent(type = 'dataChange', subtype = 'stones', operation = "update", sphereId = "testSphere", data = {}) : any {
  return {
    type:        type,
    subType:     subtype,
    operation:   operation,
    sphere:      {id: sphereId},
    changedItem: data,
  }
}

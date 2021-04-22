import {Dbs} from '../../src/crownstone/Data/DbReference';
import {property} from '@loopback/repository';


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


export async function createHub() {
  await Dbs.hub.create({
    token:'token',
    cloudId:'cloudId',
    name:'name',
    uartKey:'uartKey',
    accessToken:'accessToken',
    accessTokenExpiration:0,
    linkedStoneId:'linkedStoneId',
    sphereId:'sphereId',
  });
}

let lastSeenToken = null;
export async function createUser(token?, role?) {
  let useToken = token ?? "DefaultAccessToken";
  lastSeenToken = useToken;
  await Dbs.user.create({
    userId: "cloudUserId",
    userToken: useToken,
    sphereRole: role ?? "admin"
  });
}


export function auth(url, token?) {
  token ??= lastSeenToken;
  return url + "?access_token=" + token
}
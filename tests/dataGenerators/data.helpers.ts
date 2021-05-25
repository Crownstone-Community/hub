import {Dbs} from '../../src/crownstone/data/DbReference';
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


export async function createAsset_mac_report(data = null, filterType?) {
  if (data === null) {
    data = Math.floor(Math.random()*1e8).toString(16)
  }
  let asset = await Dbs.assets.create({
    inputData: {type:'MANUFACTURER_ID'},
    outputDescription: {type:'MAC_ADDRESS_REPORT'},
    committed: true,
    desiredFilterType: filterType,
    markedForDeletion: false,
    data: data,
    profileId: 0
  })
  return asset;
}
export async function createAsset_ad_report(adType = 23, mask = 523465324, data = null) {
  if (data === null) {
    data = Math.floor(Math.random()*1e8).toString(16)
  }
  return await Dbs.assets.create({
    inputData: {type:'FULL_AD_DATA', adType: adType, mask: mask},
    outputDescription: {type:'MAC_ADDRESS_REPORT'},
    committed: true,
    markedForDeletion: false,
    data: data,
    profileId: 0
  })
}
export async function createAsset_ad_track_mac(adType = 23, mask = 523465324, data = null) {
  if (data === null) {
    data = Math.floor(Math.random()*1e8).toString(16)
  }
  return await Dbs.assets.create({
    inputData: {type:'FULL_AD_DATA', adType: adType, mask: mask},
    outputDescription: {type:'SHORT_ASSET_ID_TRACK',inputData:{type:'MAC_ADDRESS'}},
    data: data,
    committed: true,
    markedForDeletion: false,
    profileId: 0
  })
}
export async function createAsset_ad_track_ad(adType = 23, mask = 523465324, data = null) {
  if (data === null) {
    data = Math.floor(Math.random()*1e8).toString(16)
  }
  return await Dbs.assets.create({
    inputData: {type:'FULL_AD_DATA', adType: adType, mask: mask},
    outputDescription: {type:'SHORT_ASSET_ID_TRACK',inputData: {type:'FULL_AD_DATA', adType: adType, mask: mask}},
    data: data,
    committed: true,
    markedForDeletion: false,
    profileId: 0
  })
}
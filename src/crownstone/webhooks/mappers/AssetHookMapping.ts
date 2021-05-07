import {MemoryDb} from '../../data/MemoryDb';


export function webhookMapAssetReportData(data: AssetMacReportData) : object {
  return {
    type:                 "ASSET_MAC_REPORT",
    crownstoneId:         data.crownstoneId,
    crownstoneMacAddress: getMacAddress(data.crownstoneId),
    assetMacAddress:      data.macAddress,
    assetRssi:            data.rssi,
    rssiChannel:          data.channel,
    timestamp:            Date.now(),
  }
}
export function webhookMapAssetReportCompressedData(data: AssetMacReportData) : object {
  return {
    i:  data.crownstoneId,
    cm: getMacAddress(data.crownstoneId),
    am: data.macAddress,
    r:  data.rssi,
    c:  data.channel,
    t:  Date.now(),
  }
}

function getMacAddress(crownstoneId: number) : string | null {
  let stone = MemoryDb.stones[crownstoneId];
  if (stone) {
    return stone.macAddress;
  }
  return null;
}
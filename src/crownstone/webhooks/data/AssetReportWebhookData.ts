import {MemoryDb} from '../../data/MemoryDb';

export class AssetReportWebhookData {

  crownstoneId:         number;
  crownstoneMacAddress: string | null;
  assetMacAddress:      string;
  assetRssi:            number;
  rssiChannel:          number;
  timestamp:            number;
  
  constructor(data: AssetMacReportData) {
    this.crownstoneId =         data.crownstoneId;
    this.crownstoneMacAddress = getMacAddressFromCrownstoneId(data.crownstoneId);
    this.assetMacAddress =      data.macAddress;
    this.assetRssi =            data.rssi;
    this.rssiChannel =          data.channel;
    this.timestamp =            Date.now();
  }

  getData() {
    return {
      crownstoneId:         this.crownstoneId,
      crownstoneMacAddress: this.crownstoneMacAddress,
      assetMacAddress:      this.assetMacAddress,
      assetRssi:            this.assetRssi,
      rssiChannel:          this.rssiChannel,
      timestamp:            this.timestamp,
    }
  }

  getCompressedData() {
    return {
      cid: this.crownstoneId,
      cm:  this.crownstoneMacAddress,
      am:  this.assetMacAddress,
      r:   this.assetRssi,
      c:   this.rssiChannel,
      t:   this.timestamp,
    }
  }
}


export function getMacAddressFromCrownstoneId(crownstoneId: number) : string | null {
  let stone = MemoryDb.stones[crownstoneId];
  if (stone) {
    return stone.macAddress;
  }
  return null;
}
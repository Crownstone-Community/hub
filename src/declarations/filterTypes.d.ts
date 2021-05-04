type filterFormat_macAddressType_t   = "MAC_ADDRESS"
type filterFormat_adDataType_t       = "AD_DATA"
type filterFormat_maskedAdDataType_t = "MASKED_AD_DATA"

type filterFormat_macAddress_report_t  = "MAC_ADDRESS_REPORT"
type filterFormat_shortAssetId_track_t = "SHORT_ASSET_ID_TRACK"

interface FormatMacAddress {
  type: filterFormat_macAddressType_t
}

interface FormatAdData {
  type:   filterFormat_adDataType_t,
  adType: number,
}

interface FormatMaskedAdData {
  type:   filterFormat_maskedAdDataType_t,
  adType: number,
  mask:   number
}

type filterHubFormat = FormatMacAddress | FormatAdData | FormatMaskedAdData;

interface FilterOutputDescription_macAddress {
  type: filterFormat_macAddress_report_t
}
interface FilterOutputDescription_shortAssetId{
  type:      filterFormat_shortAssetId_track_t,
  inputData: filterHubFormat
}

type filterHubOutputDescription = FilterOutputDescription_macAddress | FilterOutputDescription_shortAssetId
import {
  FilterFormatFullAdData,
  FilterFormatMacAddress,
  FilterFormatMaskedAdData,
  FilterMetaData,
  FilterOutputDescription,
  FilterOutputDescriptionType,
  getMasterCRC,
} from 'crownstone-core';
import {AssetFilter} from '../../models/cloud/asset-filter.model';
import {Asset, filterFormat, filterOutputDescription} from '../../models/cloud/asset.model';
import {FilterInputManufacturerId} from 'crownstone-core/dist/packets/AssetFilters/FilterMetaDataPackets';

export const FilterUtil = {

  getMetaData: function(filter: AssetFilter) {
    return FilterUtil.getFilterMetaData(filter.type, filter.profileId, filter.inputData, filter. outputDescription);
  },


  getFilterMetaData: function(
    type : number,
    profileId : number,
    inputData: filterHubFormat,
    outputDescription: filterHubOutputDescription
  ) {
    let meta = new FilterMetaData(profileId, type);

    switch (inputData.type) {
      case "MAC_ADDRESS":     meta.input = new FilterFormatMacAddress(); break;
      case "FULL_AD_DATA":    meta.input = new FilterFormatFullAdData( inputData.adType ); break;
      case "MANUFACTURER_ID": meta.input = new FilterInputManufacturerId(); break;
      case "MASKED_AD_DATA":  meta.input = new FilterFormatMaskedAdData( inputData.adType, inputData.mask ); break;
    }

    switch (outputDescription.type) {
      case "MAC_ADDRESS_REPORT":
        meta.outputDescription = new FilterOutputDescription(FilterOutputDescriptionType.MAC_ADDRESS_REPORT); break;
      case "SHORT_ASSET_ID_TRACK":
        switch (outputDescription.inputData.type) {
          case "MAC_ADDRESS":
            meta.outputDescription = new FilterOutputDescription(FilterOutputDescriptionType.SHORT_ASSET_ID_TRACK, new FilterFormatMacAddress());
            break;
          case "FULL_AD_DATA":
            meta.outputDescription = new FilterOutputDescription(FilterOutputDescriptionType.SHORT_ASSET_ID_TRACK, new FilterFormatFullAdData( outputDescription.inputData.adType ));
            break;
          case "MASKED_AD_DATA":
            meta.outputDescription = new FilterOutputDescription(FilterOutputDescriptionType.SHORT_ASSET_ID_TRACK, new FilterFormatMaskedAdData( outputDescription.inputData.adType, outputDescription.inputData.mask ));
            break;
          default:
            console.log("Invalid input data type received", outputDescription.inputData)
            throw "INVALID_INPUTDATA_TYPE"
        };
        break;
      default:
        console.log("Invalid outputDescription data type received", outputDescription)
        throw "INVALID_OUTPUT_DESCRIPTION_TYPE"
    }

    return meta;
  },


  generateMasterCRC: function(filters: AssetFilter[]) : number {
    let payload : Record<filterId, filterCRC> = {};
    // map to required format.
    for (let filter of filters) {
      payload[filter.idOnCrownstone] = parseInt(filter.dataCRC, 16);
    }
    return getMasterCRC(payload)
  },


  getMetaDataDescriptionFromAsset: function(asset: Asset) {
    return FilterUtil.getMetaDataDescription(asset.profileId, asset.inputData, asset.outputDescription);
  },


  getMetaDataDescriptionFromFilter: function(filter: AssetFilter) {
    return FilterUtil.getMetaDataDescription(filter.profileId, filter.inputData, filter.outputDescription);
  },


  getMetaDataDescription: function(
    profileId: number,
    input : filterFormat,
    output: filterOutputDescription,
  ) : string {

    let inputSet = '' + input.type;
    let outputSet = '' + output.type;
    switch (input.type) {
      case 'MAC_ADDRESS':
        break;
      case 'FULL_AD_DATA':
        inputSet += input.adType;
        break;
      case 'MASKED_AD_DATA':
        inputSet += input.adType;
        inputSet += input.mask;
        break;
      case 'MANUFACTURER_ID':
        inputSet += "MANUFACTURER_ID"
    }


    if (input.type === "FULL_AD_DATA") {
      inputSet += input.adType;
    }
    if (output.type === 'SHORT_ASSET_ID_TRACK') {
      outputSet += output.inputData.type;
      switch (output.inputData.type) {
        case 'MAC_ADDRESS':
          break;
        case 'FULL_AD_DATA':
          outputSet += output.inputData.adType;
          break;
        case 'MASKED_AD_DATA':
          outputSet += output.inputData.adType;
          outputSet += output.inputData.mask;
          break;
      }
    }

    return `${inputSet}_${outputSet}_p${profileId}`;
  },

}
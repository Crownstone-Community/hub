import {FilterFormatAdData, FilterFormatMacAddress, FilterFormatMaskedAdData, FilterMetaData, FilterOutputDescription, FilterOutputDescriptionType} from 'crownstone-core';

export const FilterUtil = {

  getFilterMetaData: function(
    type : number,
    profileId : number,
    inputData: filterHubFormat,
    outputDescription: filterHubOutputDescription
  ) {
    let meta = new FilterMetaData();

    meta.type = type;
    meta.profileId = profileId;

    switch (inputData.type) {
      case "MAC_ADDRESS":    meta.input = new FilterFormatMacAddress(); break;
      case "AD_DATA":        meta.input = new FilterFormatAdData( inputData.adType ); break;
      case "MASKED_AD_DATA": meta.input = new FilterFormatMaskedAdData( inputData.adType, inputData.mask ); break;
    }

    switch (outputDescription.type) {
      case "MAC_ADDRESS_REPORT":
        meta.outputDescription = new FilterOutputDescription(FilterOutputDescriptionType.MAC_ADDRESS_REPORT); break;
      case "SHORT_ASSET_ID_TRACK":
        switch (outputDescription.inputData.type) {
          case "MAC_ADDRESS":
            meta.outputDescription = new FilterOutputDescription(FilterOutputDescriptionType.SHORT_ASSET_ID_TRACK, new FilterFormatMacAddress());
            break;
          case "AD_DATA":
            meta.outputDescription = new FilterOutputDescription(FilterOutputDescriptionType.SHORT_ASSET_ID_TRACK, new FilterFormatAdData( outputDescription.inputData.adType ));
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
  }
}
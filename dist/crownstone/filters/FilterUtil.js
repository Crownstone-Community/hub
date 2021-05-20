"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterUtil = void 0;
const crownstone_core_1 = require("crownstone-core");
const FilterMetaDataPackets_1 = require("crownstone-core/dist/packets/AssetFilters/FilterMetaDataPackets");
exports.FilterUtil = {
    getMetaData: function (filter) {
        return exports.FilterUtil.getFilterMetaData(filter.type, filter.profileId, filter.inputData, filter.outputDescription);
    },
    getFilterMetaData: function (type, profileId, inputData, outputDescription) {
        let meta = new crownstone_core_1.FilterMetaData(profileId, type);
        switch (inputData.type) {
            case "MAC_ADDRESS":
                meta.input = new crownstone_core_1.FilterFormatMacAddress();
                break;
            case "FULL_AD_DATA":
                meta.input = new crownstone_core_1.FilterFormatFullAdData(inputData.adType);
                break;
            case "MANUFACTURER_ID":
                meta.input = new FilterMetaDataPackets_1.FilterInputManufacturerId();
                break;
            case "MASKED_AD_DATA":
                meta.input = new crownstone_core_1.FilterFormatMaskedAdData(inputData.adType, inputData.mask);
                break;
        }
        switch (outputDescription.type) {
            case "MAC_ADDRESS_REPORT":
                meta.outputDescription = new crownstone_core_1.FilterOutputDescription(crownstone_core_1.FilterOutputDescriptionType.MAC_ADDRESS_REPORT);
                break;
            case "SHORT_ASSET_ID_TRACK":
                switch (outputDescription.inputData.type) {
                    case "MAC_ADDRESS":
                        meta.outputDescription = new crownstone_core_1.FilterOutputDescription(crownstone_core_1.FilterOutputDescriptionType.SHORT_ASSET_ID_TRACK, new crownstone_core_1.FilterFormatMacAddress());
                        break;
                    case "FULL_AD_DATA":
                        meta.outputDescription = new crownstone_core_1.FilterOutputDescription(crownstone_core_1.FilterOutputDescriptionType.SHORT_ASSET_ID_TRACK, new crownstone_core_1.FilterFormatFullAdData(outputDescription.inputData.adType));
                        break;
                    case "MASKED_AD_DATA":
                        meta.outputDescription = new crownstone_core_1.FilterOutputDescription(crownstone_core_1.FilterOutputDescriptionType.SHORT_ASSET_ID_TRACK, new crownstone_core_1.FilterFormatMaskedAdData(outputDescription.inputData.adType, outputDescription.inputData.mask));
                        break;
                    default:
                        console.log("Invalid input data type received", outputDescription.inputData);
                        throw "INVALID_INPUTDATA_TYPE";
                }
                ;
                break;
            default:
                console.log("Invalid outputDescription data type received", outputDescription);
                throw "INVALID_OUTPUT_DESCRIPTION_TYPE";
        }
        return meta;
    },
    generateMasterCRC: function (filters) {
        let payload = {};
        // map to required format.
        for (let filter of filters) {
            payload[filter.idOnCrownstone] = parseInt(filter.dataCRC, 16);
        }
        return crownstone_core_1.getMasterCRC(payload);
    },
    getMetaDataDescriptionFromAsset: function (asset) {
        return exports.FilterUtil.getMetaDataDescription(asset.profileId, asset.inputData, asset.outputDescription);
    },
    getMetaDataDescriptionFromFilter: function (filter) {
        return exports.FilterUtil.getMetaDataDescription(filter.profileId, filter.inputData, filter.outputDescription);
    },
    getMetaDataDescription: function (profileId, input, output) {
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
                inputSet += "MANUFACTURER_ID";
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
};
//# sourceMappingURL=FilterUtil.js.map
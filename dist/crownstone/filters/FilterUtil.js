"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterUtil = void 0;
const crownstone_core_1 = require("crownstone-core");
const crownstone_core_2 = require("crownstone-core");
exports.FilterUtil = {
    // getMetaData: function(filter: AssetFilter) {
    //   return FilterUtil.getFilterMetaData(filter.type, filter.profileId, filter.inputData, filter. outputDescription);
    // },
    setFilterMetaData: function (filter, type, profileId, inputData, outputDescription) {
        filter.setFilterType(type === "CUCKOO" ? crownstone_core_1.FilterType.CUCKCOO_V1 : crownstone_core_1.FilterType.EXACT_MATCH);
        filter.useAsProfileId(profileId);
        switch (inputData.type) {
            case "MAC_ADDRESS":
                filter.filterOnMacAddress();
                break;
            case "MANUFACTURER_ID":
                filter.filterOnManufacturerId();
                break;
            case "FULL_AD_DATA":
                filter.filterOnFullAdData(inputData.adType);
                break;
            case "MASKED_AD_DATA":
                filter.filterOnMaskedAdData(inputData.adType, inputData.mask);
                break;
        }
        switch (outputDescription.type) {
            case "MAC_ADDRESS_REPORT":
                filter.outputMacRssiReport();
                break;
            case "SHORT_ASSET_ID_TRACK":
                switch (outputDescription.inputData.type) {
                    case "MAC_ADDRESS":
                        filter.outputTrackableShortIdBasedOnMacAddress();
                        break;
                    case "FULL_AD_DATA":
                        filter.outputTrackableShortIdBasedOnFullAdType(outputDescription.inputData.adType);
                        break;
                    case "MASKED_AD_DATA":
                        filter.outputTrackableShortIdBasedOnMaskedAdType(outputDescription.inputData.adType, outputDescription.inputData.mask);
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
        return filter.metaData;
    },
    getFilterSizeOverhead(asset) {
        // it does not matter here whether it is EXACT_MATCH or something else.
        let filter = new crownstone_core_2.AssetFilter();
        return exports.FilterUtil.setFilterMetaData(filter, "EXACT_MATCH", asset.profileId, asset.inputData, asset.outputDescription).getPacket().length;
    },
    generateMasterCRC: function (filters) {
        let payload = {};
        // map to required format.
        for (let filter of filters) {
            payload[filter.idOnCrownstone] = parseInt(filter.dataCRC, 16);
        }
        return crownstone_core_1.getMasterCRC(payload);
    },
    getMetaDataDescriptionFromAsset: function (asset, filterType) {
        if (filterType === "EXACT_MATCH") {
            let dataBytes = Buffer.from(asset.data, 'hex');
            filterType = "EXACT_MATCH:" + dataBytes.length;
        }
        return exports.FilterUtil.getMetaDataDescription(asset.profileId, asset.inputData, asset.outputDescription, filterType);
    },
    getMetaDataDescriptionFromFilter: async function (filter) {
        let filterType = filter.type;
        if (filter.type === "EXACT_MATCH") {
            // we have to get the dataLength from the assets in the filter.
            let assets = filter.assets;
            if (assets && assets.length > 0) {
                let dataBytes = Buffer.from(assets[0].data, 'hex');
                filterType = "EXACT_MATCH:" + dataBytes.length;
            }
        }
        return exports.FilterUtil.getMetaDataDescription(filter.profileId, filter.inputData, filter.outputDescription, filterType);
    },
    /**
     * In the case of filter types which depend on an exact amount of bytes, the type is appended with ":<bytelength>", ie: ":2"
     * @param profileId
     * @param input
     * @param output
     * @param type
     */
    getMetaDataDescription: function (profileId, input, output, type) {
        let inputSet = '' + input.type;
        let outputSet = '' + output.type;
        switch (input.type) {
            case 'MAC_ADDRESS':
            case 'MANUFACTURER_ID':
                break;
            case 'FULL_AD_DATA':
                inputSet += input.adType;
                break;
            case 'MASKED_AD_DATA':
                inputSet += input.adType;
                inputSet += input.mask;
                break;
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
        return `${type}_${inputSet}_${outputSet}_p${profileId}`;
    },
};
//# sourceMappingURL=FilterUtil.js.map
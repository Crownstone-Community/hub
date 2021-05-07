"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterUtil = void 0;
const crownstone_core_1 = require("crownstone-core");
exports.FilterUtil = {
    getMetaData: function (filter) {
        return exports.FilterUtil.getFilterMetaData(filter.type, filter.profileId, filter.inputData, filter.outputDescription);
    },
    getFilterMetaData: function (type, profileId, inputData, outputDescription) {
        let meta = new crownstone_core_1.FilterMetaData();
        meta.type = type;
        meta.profileId = profileId !== null && profileId !== void 0 ? profileId : 255;
        switch (inputData.type) {
            case "MAC_ADDRESS":
                meta.input = new crownstone_core_1.FilterFormatMacAddress();
                break;
            case "AD_DATA":
                meta.input = new crownstone_core_1.FilterFormatAdData(inputData.adType);
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
                    case "AD_DATA":
                        meta.outputDescription = new crownstone_core_1.FilterOutputDescription(crownstone_core_1.FilterOutputDescriptionType.SHORT_ASSET_ID_TRACK, new crownstone_core_1.FilterFormatAdData(outputDescription.inputData.adType));
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
    }
};
//# sourceMappingURL=FilterUtil.js.map
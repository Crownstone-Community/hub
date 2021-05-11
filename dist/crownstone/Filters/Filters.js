"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetaDataDescription = exports.getMetaDataDescriptionFromFilter = exports.getMetaDataDescriptionFromAsset = exports.reconstructFilters = void 0;
const DbReference_1 = require("../data/DbReference");
const FilterUtil_1 = require("./FilterUtil");
const crownstone_core_1 = require("crownstone-core");
/**
 * This does and add or delete of the filters.
 * Filters are not updated.
 * @param allAssets
 * @param allFilters
 */
async function reconstructFilters(allAssets, allFilters) {
    let filterChangeRequired = false;
    let filterRequirements = {};
    // summarize the filters we need to construct
    for (let asset of allAssets) {
        let typeDescription = getMetaDataDescriptionFromAsset(asset);
        if (filterRequirements[typeDescription] === undefined) {
            filterRequirements[typeDescription] = {
                inputData: asset.inputData,
                outputDescription: asset.outputDescription,
                profileId: asset.profileId,
                data: [],
                dataMap: {},
                assets: [],
                filterType: crownstone_core_1.FilterType.CUCKCOO_V1,
                exists: false,
            };
        }
        filterRequirements[typeDescription].assets.push(asset);
        if (filterRequirements[typeDescription].dataMap[asset.data] === undefined) {
            filterRequirements[typeDescription].dataMap[asset.data] = true;
            filterRequirements[typeDescription].data.push(asset.data);
        }
    }
    // contruct filters from requirements
    for (let description in filterRequirements) {
        let requirement = filterRequirements[description];
        let metaData = FilterUtil_1.FilterUtil.getFilterMetaData(requirement.filterType, requirement.profileId, requirement.inputData, requirement.outputDescription);
        let filter = new crownstone_core_1.AssetFilter(metaData);
        for (let data of requirement.data) {
            filter.addToFilter(Buffer.from(data, 'hex'));
            ;
        }
        let filterPacket = filter.getFilterPacket();
        let metadataPacket = metaData.getPacket();
        requirement.filterPacket = Buffer.concat([metadataPacket, filterPacket]).toString('hex');
        requirement.filterCRC = filter.getCRC().toString(16);
    }
    // match against the existing filters.
    for (let filter of allFilters) {
        let typeDescription = getMetaDataDescriptionFromFilter(filter);
        let requiredMatchingVersion = filterRequirements[typeDescription];
        if (requiredMatchingVersion && requiredMatchingVersion.filterPacket === filter.data) {
            requiredMatchingVersion.exists = true;
            await updateAssetFilterIds(requiredMatchingVersion.assets, filter.id).catch();
        }
        else {
            // Delete this filter.
            filterChangeRequired = true;
            await DbReference_1.Dbs.assetFilters.delete(filter).catch((err) => { console.log("Error while removing filter", err); });
        }
    }
    for (let description in filterRequirements) {
        let requirement = filterRequirements[description];
        if (requirement.exists === false) {
            // create filter.
            filterChangeRequired = true;
            let newFilter = await DbReference_1.Dbs.assetFilters.create({
                type: requirement.filterType,
                profileId: requirement.profileId,
                inputData: requirement.inputData,
                outputDescription: requirement.outputDescription,
                data: requirement.filterPacket,
                dataCRC: requirement.filterCRC,
            });
            await updateAssetFilterIds(requirement.assets, newFilter.id).catch();
        }
    }
    return filterChangeRequired;
}
exports.reconstructFilters = reconstructFilters;
async function updateAssetFilterIds(assets, filterId) {
    for (let asset of assets) {
        if (asset.filterId !== filterId) {
            asset.filterId = filterId;
            await DbReference_1.Dbs.assets.update(asset);
        }
    }
}
function getMetaDataDescriptionFromAsset(asset) {
    return getMetaDataDescription(asset.profileId, asset.inputData, asset.outputDescription);
}
exports.getMetaDataDescriptionFromAsset = getMetaDataDescriptionFromAsset;
function getMetaDataDescriptionFromFilter(filter) {
    return getMetaDataDescription(filter.profileId, filter.inputData, filter.outputDescription);
}
exports.getMetaDataDescriptionFromFilter = getMetaDataDescriptionFromFilter;
function getMetaDataDescription(profileId, input, output) {
    let inputSet = '' + input.type;
    let outputSet = '' + output.type;
    switch (input.type) {
        case 'MAC_ADDRESS':
            break;
        case 'AD_DATA':
            inputSet += input.adType;
            break;
        case 'MASKED_AD_DATA':
            inputSet += input.adType;
            inputSet += input.mask;
            break;
    }
    if (input.type === "AD_DATA") {
        inputSet += input.adType;
    }
    if (output.type === 'SHORT_ASSET_ID_TRACK') {
        outputSet += output.inputData.type;
        switch (output.inputData.type) {
            case 'MAC_ADDRESS':
                break;
            case 'AD_DATA':
                outputSet += output.inputData.adType;
                break;
            case 'MASKED_AD_DATA':
                outputSet += output.inputData.adType;
                outputSet += output.inputData.mask;
                break;
        }
    }
    return `${inputSet}_${outputSet}_p${profileId}`;
}
exports.getMetaDataDescription = getMetaDataDescription;
//# sourceMappingURL=Filters.js.map
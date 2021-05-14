"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterManager = exports.FilterManagerClass = void 0;
const DbReference_1 = require("../data/DbReference");
const crownstone_core_1 = require("crownstone-core");
const FilterUtil_1 = require("./FilterUtil");
const AssetFilter_1 = require("crownstone-core/dist/filters/AssetFilter");
class FilterManagerClass {
    constructor() {
        this.initialized = false;
        this.uartReference = null;
    }
    injectUartReference(uartReference) {
        this.uartReference = uartReference;
    }
    async refreshFilterSets(baseMasterVersion = 1, allowSyncing = true) {
        if (this.uartReference === null) {
            throw "UART_NOT_READY";
        }
        let allFilters = await DbReference_1.Dbs.assetFilters.find();
        let allSets = await DbReference_1.Dbs.assetFilterSets.find();
        if (allSets.length === 0) {
            // create filterSet
            let newSet = await DbReference_1.Dbs.assetFilterSets.create({
                masterVersion: baseMasterVersion,
                masterCRC: FilterUtil_1.FilterUtil.generateMasterCRC(allFilters),
            });
            await updateFilterSetIds(allFilters, newSet.id);
            if (allowSyncing) {
                await this.uartReference.syncFilters();
            }
        }
        else if (allSets.length === 1) {
            // bump filtersets if required.
            // we do an add-delete of the filters. They're not updated.
            let changeRequired = false;
            for (let filter of allFilters) {
                if (!filter.filterSetId) {
                    changeRequired = true;
                    break;
                }
            }
            let set = allSets[0];
            let masterCRC = FilterUtil_1.FilterUtil.generateMasterCRC(allFilters);
            if (masterCRC !== set.masterCRC) {
                changeRequired = true;
            }
            if (changeRequired) {
                set.masterVersion = crownstone_core_1.increaseMasterVersion(set.masterVersion);
                set.masterCRC = FilterUtil_1.FilterUtil.generateMasterCRC(allFilters);
                await updateFilterSetIds(allFilters, set.id);
                await DbReference_1.Dbs.assetFilterSets.update(set);
                if (allowSyncing) {
                    await this.uartReference.syncFilters();
                }
            }
        }
        else { //(allSets.length > 1)
            let highestNumber = 0;
            for (let set of allSets) {
                highestNumber = Math.max(set.masterVersion, highestNumber);
            }
            // something went wrong, override the masterVersion
            await DbReference_1.Dbs.assetFilterSets.deleteAll({});
            await this.refreshFilterSets(highestNumber + 1);
            if (allowSyncing) {
                await this.uartReference.syncFilters();
            }
        }
    }
    async reconstructFilters() {
        let allAssets = await DbReference_1.Dbs.assets.find({ where: { committed: true } });
        let allFilters = await DbReference_1.Dbs.assetFilters.find();
        let filterChangeRequired = false;
        let filterRequirements = {};
        // summarize the filters we need to construct
        for (let asset of allAssets) {
            let typeDescription = FilterUtil_1.FilterUtil.getMetaDataDescriptionFromAsset(asset);
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
            let filter = new AssetFilter_1.AssetFilter(metaData);
            for (let data of requirement.data) {
                filter.addToFilter(Buffer.from(data, 'hex'));
                ;
            }
            let filterPacket = filter.getFilterPacket();
            requirement.filterPacket = filterPacket.toString('hex');
            requirement.filterCRC = filter.getCRC().toString(16);
        }
        // match against the existing filters.
        let ids = {};
        for (let filter of allFilters) {
            ids[filter.idOnCrownstone] = true;
            let typeDescription = FilterUtil_1.FilterUtil.getMetaDataDescriptionFromFilter(filter);
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
                let filterId = getFilterId(ids);
                filterChangeRequired = true;
                let newFilter = await DbReference_1.Dbs.assetFilters.create({
                    type: requirement.filterType,
                    profileId: requirement.profileId,
                    idOnCrownstone: filterId,
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
}
exports.FilterManagerClass = FilterManagerClass;
function getFilterId(ids) {
    for (let i = 0; i < 256; i++) {
        if (ids[i] === undefined) {
            ids[i] = true;
            return i;
        }
    }
    return 0;
}
async function updateFilterSetIds(filters, setId) {
    for (let filter of filters) {
        if (filter.filterSetId !== setId) {
            filter.filterSetId = setId;
            await DbReference_1.Dbs.assetFilters.update(filter);
        }
    }
}
async function updateAssetFilterIds(assets, filterId) {
    for (let asset of assets) {
        if (asset.filterId !== filterId) {
            asset.filterId = filterId;
            await DbReference_1.Dbs.assets.update(asset);
        }
    }
}
exports.FilterManager = new FilterManagerClass();
//# sourceMappingURL=FilterManager.js.map
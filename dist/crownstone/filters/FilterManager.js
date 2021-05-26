"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterManager = exports.FilterManagerClass = void 0;
const DbReference_1 = require("../data/DbReference");
const crownstone_core_1 = require("crownstone-core");
const FilterUtil_1 = require("./FilterUtil");
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
        let allFilters = await DbReference_1.Dbs.assetFilters.find({ include: [{ relation: "assets" }] });
        let filterChangeRequired = false;
        let filterRequirements = {};
        // amount of defined filters used to determine which type of filter to use for the assets without desiredFilterType
        const maxAmountOfFiltersAllowed = 8;
        let amountOfRequiredFilters = 0;
        // this size estimate can be used to determine which type of filter to use for the assets without desiredFilterType
        const maxSizeAllowed = 500;
        let definedSizeEstimate = 0;
        // this closure will place an asset in the filterRequirements summary
        function placeAssetInSet(asset, filterType) {
            let typeDescription = FilterUtil_1.FilterUtil.getMetaDataDescriptionFromAsset(asset, filterType);
            let overhead = FilterUtil_1.FilterUtil.getFilterSizeOverhead(asset);
            if (filterRequirements[typeDescription] === undefined) {
                filterRequirements[typeDescription] = {
                    filterType: filterType,
                    inputData: asset.inputData,
                    outputDescription: asset.outputDescription,
                    profileId: asset.profileId,
                    data: [],
                    dataMap: {},
                    assets: [],
                    sizeEstimate: overhead,
                    exists: false,
                };
                if (filterType) {
                    amountOfRequiredFilters++;
                }
            }
            filterRequirements[typeDescription].assets.push(asset);
            let dataBytes = Buffer.from(asset.data, 'hex');
            if (filterRequirements[typeDescription].dataMap[asset.data] === undefined) {
                filterRequirements[typeDescription].dataMap[asset.data] = true;
                filterRequirements[typeDescription].data.push(dataBytes);
                // keep track of how much data we plan to use on the Crownstone for these filters
                // this estimate is without overhead.
                if (filterType === 'CUCKOO') {
                    filterRequirements[typeDescription].sizeEstimate += 2;
                    definedSizeEstimate += 2;
                }
                else if (filterType === 'EXACT_MATCH') {
                    filterRequirements[typeDescription].sizeEstimate += dataBytes.length;
                    definedSizeEstimate += dataBytes.length;
                }
            }
        }
        // Look through all of the assets and determine which sort of filter is required for them.
        for (let asset of allAssets) {
            placeAssetInSet(asset, asset.desiredFilterType ?? "UNSPECIFIED");
        }
        // check if the defined assets can be loaded onto the Crownstone.
        let remainingSpace = maxSizeAllowed - definedSizeEstimate;
        if (remainingSpace < 0) {
            throw "NOT_ENOUGH_MEMORY_FOR_ALL_ASSETS";
        }
        let remainingFilterSpaces = maxAmountOfFiltersAllowed - amountOfRequiredFilters;
        if (remainingFilterSpaces < 0) {
            throw "NOT_ENOUGH_FILTER_SLOTS_TO_CREATE_FILTERS";
        }
        let unspecifiedType = null;
        if (remainingFilterSpaces - getAmountOfUnspecifiedFiltersIfExact(filterRequirements) < 0) {
            if (remainingFilterSpaces - getAmountOfUnspecifiedFiltersIfCuckoo(filterRequirements) < 0) {
                throw "NOT_ENOUGH_FILTER_SLOTS_AVAILABLE_FOR_UNSPECIFIED_FILTERS";
            }
            else {
                unspecifiedType = "CUCKOO";
            }
        }
        // first check which filters we want to use for the unspecified filter types
        // the selection process is as follows:
        // 1 - is there space available to store the assets without compression?
        //     - sort the filters based on data length
        //     - see if we can join them in an existing EXACT MATCH filter
        //     - determine if we have room for the amount of required extra filters
        if (remainingSpace - getUnspecifiedExactSpaceRequirements(filterRequirements) > 0) {
            // there is space for the filters uncompressed.
            unspecifiedType = unspecifiedType ?? "EXACT_MATCH";
        }
        else if (remainingSpace - getUnspecifiedCompressedSpaceRequirements(filterRequirements) > 0) {
            // it fits if we compress it.
            unspecifiedType = unspecifiedType ?? "CUCKOO";
        }
        else {
            throw "NO_MEMORY_AVAILABLE_FOR_ALL_ASSETS";
        }
        // place all unspecified assets in a type of filter.
        markUnspecifiedAs(unspecifiedType, filterRequirements, placeAssetInSet);
        // contruct filters from requirements
        for (let description in filterRequirements) {
            let requirement = filterRequirements[description];
            let filter = new crownstone_core_1.AssetFilter();
            FilterUtil_1.FilterUtil.setFilterMetaData(filter, requirement.filterType, requirement.profileId, requirement.inputData, requirement.outputDescription);
            for (let data of requirement.data) {
                filter.addToFilter(data);
            }
            let filterPacket = filter.getFilterPacket();
            requirement.filterPacket = filterPacket.toString('hex');
            requirement.filterCRC = filter.getCRC().toString(16);
        }
        // match against the existing filters.
        let ids = {};
        for (let filter of allFilters) {
            ids[filter.idOnCrownstone] = true;
            let typeDescription = await FilterUtil_1.FilterUtil.getMetaDataDescriptionFromFilter(filter);
            let requiredMatchingVersion = filterRequirements[typeDescription];
            if (requiredMatchingVersion && requiredMatchingVersion.filterPacket === filter.data) {
                // this covers the case if there are assets whose data is already housed in a different filter.
                requiredMatchingVersion.exists = true;
                await updateAssetFilterIds(requiredMatchingVersion.assets, filter.id).catch();
            }
            else {
                // Delete this filter since it is not required by any of the available assets.
                filterChangeRequired = true;
                await DbReference_1.Dbs.assetFilters.deleteById(filter.id).catch((err) => { console.log("Error while removing filter", err); });
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
function getUnspecifiedExactSpaceRequirements(filterRequirements) {
    let total = 0;
    for (let typeDescription in filterRequirements) {
        let r = filterRequirements[typeDescription];
        if (r.filterType !== "UNSPECIFIED") {
            continue;
        }
        total += r.sizeEstimate;
        for (let datapoint of r.data) {
            total += datapoint.length;
        }
    }
    return total;
}
function getAmountOfUnspecifiedFiltersIfExact(filterRequirements) {
    let total = 0;
    for (let typeDescription in filterRequirements) {
        let r = filterRequirements[typeDescription];
        if (r.filterType !== "UNSPECIFIED") {
            continue;
        }
        let sizeMap = {};
        for (let datapoint of r.data) {
            sizeMap[String(datapoint.length)] = true;
        }
        total += Object.keys(sizeMap).length;
    }
    return total;
}
function getAmountOfUnspecifiedFiltersIfCuckoo(filterRequirements) {
    let total = 0;
    for (let typeDescription in filterRequirements) {
        let r = filterRequirements[typeDescription];
        if (r.filterType !== "UNSPECIFIED") {
            continue;
        }
        total += 1;
    }
    return total;
}
function getUnspecifiedCompressedSpaceRequirements(filterRequirements, size = 2) {
    let total = 0;
    for (let typeDescription in filterRequirements) {
        let r = filterRequirements[typeDescription];
        if (r.filterType !== "UNSPECIFIED") {
            continue;
        }
        total += r.sizeEstimate;
        for (let datapoint of r.data) {
            total += size;
        }
    }
    return total;
}
function markUnspecifiedAs(filterType, filterRequirements, allocationClosure) {
    for (let typeDescription in filterRequirements) {
        let r = filterRequirements[typeDescription];
        if (r.filterType !== "UNSPECIFIED") {
            continue;
        }
        for (let asset of r.assets) {
            allocationClosure(asset, filterType);
        }
        ;
        delete filterRequirements[typeDescription];
    }
}
exports.FilterManager = new FilterManagerClass();
//# sourceMappingURL=FilterManager.js.map
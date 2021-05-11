"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterManager = void 0;
const DbReference_1 = require("../data/DbReference");
const crownstone_core_1 = require("crownstone-core");
class FilterManager {
    constructor(uartReference) {
        this.initialized = false;
        this.uartReference = uartReference;
    }
    init() {
        if (this.initialized === false) {
            this.initialized = true;
        }
    }
    cleanup() {
    }
    async refreshFilterSets(baseMasterVersion = 1) {
        let allFilters = await DbReference_1.Dbs.assetFilters.find();
        let allSets = await DbReference_1.Dbs.assetFilterSets.find();
        if (allSets.length === 0) {
            // create filterSet
            let newSet = await DbReference_1.Dbs.assetFilterSets.create({
                masterVersion: baseMasterVersion,
                masterCRC: generateMasterCRC(allFilters)
            });
            await updateFilterSetIds(allFilters, newSet.id);
            await this.uartReference.syncFilters();
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
            if (changeRequired) {
                set.masterVersion = set.masterVersion + 1;
                set.masterCRC = generateMasterCRC(allFilters);
                // lollipop impementation of master version
                if (set.masterVersion > 65535) {
                    set.masterVersion = 1;
                }
                await updateFilterSetIds(allFilters, set.id);
                await DbReference_1.Dbs.assetFilterSets.update(set);
                await this.uartReference.syncFilters();
            }
        }
        else {
            let highestNumber = 0;
            for (let set of allSets) {
                highestNumber = Math.max(set.masterVersion, highestNumber);
            }
            // something went wrong, override the masterVersion
            await DbReference_1.Dbs.assetFilterSets.deleteAll({});
            await this.refreshFilterSets(highestNumber + 1);
        }
    }
}
exports.FilterManager = FilterManager;
async function updateFilterSetIds(filters, setId) {
    for (let filter of filters) {
        if (filter.filterSetId !== setId) {
            filter.filterSetId = setId;
            await DbReference_1.Dbs.assetFilters.update(filter);
        }
    }
}
function generateMasterCRC(filters) {
    let payload = {};
    // map to required format.
    for (let filter of filters) {
        payload[filter.idOnCrownstone] = parseInt(filter.dataCRC);
    }
    return crownstone_core_1.getMasterCRC(payload);
}
//# sourceMappingURL=FilterManager.js.map
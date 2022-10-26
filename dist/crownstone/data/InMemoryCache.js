"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCache = void 0;
const Logger_1 = require("../../Logger");
const log = (0, Logger_1.Logger)(__filename);
class InMemoryCache {
    constructor(capacity, batchStorageMethod, name) {
        this.processing = false;
        this.cache = [];
        this.reserve = [];
        this.batchStorageMethod = batchStorageMethod;
        this.capacity = capacity;
        this.name = name;
    }
    collect(data) {
        if (this.processing) {
            this.reserve.push(data);
            if (this.reserve.length > this.capacity) {
                this.reserve.shift();
            }
        }
        else {
            this.cache.push(data);
            if (this.cache.length > this.capacity) {
                this.cache.shift();
            }
        }
    }
    async store() {
        if (this.processing) {
            return;
        }
        this.processing = true;
        log.verbose("Storing memory cache for", this.name, "containing:", this.cache.length, this.reserve.length, 'items');
        if (this.cache.length > 0) {
            try {
                await this.batchStorageMethod(this.cache);
            }
            catch (err) {
                switch (err?.message) {
                    case "COULD_NOT_PROCESS_DATA":
                        // something went wrong, we should not clear the cache.
                        return;
                    case "COULD_NOT_STORE":
                        // something went wrong, we should not clear the cache.
                        return;
                    case "FAILED_TO_STORE":
                    // here we clear the cache, because we don't want to store the same data again..
                }
            }
            this.cache = [];
        }
        this.processing = false;
        if (this.reserve.length > 0) {
            try {
                await this.batchStorageMethod(this.reserve);
            }
            catch (err) {
                switch (err?.message) {
                    case "COULD_NOT_PROCESS_DATA":
                        // something went wrong, we should not clear the cache.
                        return;
                    case "COULD_NOT_STORE":
                        // something went wrong, we should not clear the cache.
                        return;
                    case "FAILED_TO_STORE":
                    // here we clear the cache, because we don't want to store the same data again..
                }
            }
            this.reserve = [];
        }
    }
}
exports.InMemoryCache = InMemoryCache;
//# sourceMappingURL=InMemoryCache.js.map
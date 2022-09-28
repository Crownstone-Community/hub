"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCache = void 0;
const Logger_1 = require("../../Logger");
const log = (0, Logger_1.Logger)(__filename);
class InMemoryCache {
    constructor(batchStorageMethod, name) {
        this.processing = false;
        this.cache = [];
        this.reserve = [];
        this.batchStorageMethod = batchStorageMethod;
        this.name = name;
    }
    collect(data) {
        if (this.processing) {
            this.reserve.push(data);
        }
        else {
            this.cache.push(data);
        }
    }
    async store() {
        if (this.processing) {
            return;
        }
        this.processing = true;
        log.verbose("Storing memory cache for", this.name, "containing:", this.cache.length, this.reserve.length, 'items');
        if (this.cache.length > 0) {
            await this.batchStorageMethod(this.cache);
            this.cache = [];
        }
        this.processing = false;
        if (this.reserve.length > 0) {
            await this.batchStorageMethod(this.reserve);
            this.reserve = [];
        }
    }
}
exports.InMemoryCache = InMemoryCache;
//# sourceMappingURL=InMemoryCache.js.map
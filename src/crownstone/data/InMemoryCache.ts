import {Logger} from '../../Logger';

const log = Logger(__filename);

export class InMemoryCache<T> {
  capacity : number;
  processing = false;

  cache   : T[] = [];
  reserve : T[] = [];

  name : string;
  batchStorageMethod : (data : T[]) => Promise<void>;

  constructor(capacity: number, batchStorageMethod : (data : T[]) => Promise<void>, name: string) {
    this.batchStorageMethod = batchStorageMethod;
    this.capacity = capacity;
    this.name = name;
  }

  collect(data: T) {
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
    if (this.processing) { return; }
    this.processing = true;

    log.verbose("Storing memory cache for", this.name, "containing:", this.cache.length, this.reserve.length,'items');

    if (this.cache.length > 0) {
      try {
        await this.batchStorageMethod(this.cache);
      }
      catch (err : any) {
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
      catch (err : any) {
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

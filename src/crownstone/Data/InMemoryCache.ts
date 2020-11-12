import {Logger} from '../../Logger';

const log = Logger(__filename);

export class InMemoryCache {
  processing = false;

  cache   : object[] = [];
  reserve : object[] = [];

  name : string;
  batchStorageMethod : (data : any) => Promise<void>;

  constructor(batchStorageMethod : (data : object[]) => Promise<void>, name: string) {
    this.batchStorageMethod = batchStorageMethod;
    this.name = name;
  }

  collect(data: object) {
    if (this.processing) {
      this.reserve.push(data)
    }
    else {
      this.cache.push(data);
    }
  }

  async store() {
    if (this.processing) { return; }
    this.processing = true;

    log.verbose("Storing memory cache for", this.name, "containing:", this.cache.length, this.reserve.length,'items');

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
export declare class InMemoryCache<T> {
    processing: boolean;
    cache: T[];
    reserve: T[];
    name: string;
    batchStorageMethod: (data: T[]) => Promise<void>;
    constructor(batchStorageMethod: (data: T[]) => Promise<void>, name: string);
    collect(data: T): void;
    store(): Promise<void>;
}

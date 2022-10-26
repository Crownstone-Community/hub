export declare class InMemoryCache<T> {
    capacity: number;
    processing: boolean;
    cache: T[];
    reserve: T[];
    name: string;
    batchStorageMethod: (data: T[]) => Promise<void>;
    constructor(capacity: number, batchStorageMethod: (data: T[]) => Promise<void>, name: string);
    collect(data: T): void;
    store(): Promise<void>;
}

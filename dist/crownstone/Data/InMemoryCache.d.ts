export declare class InMemoryCache {
    processing: boolean;
    cache: object[];
    reserve: object[];
    name: string;
    batchStorageMethod: (data: any) => Promise<void>;
    constructor(batchStorageMethod: (data: object[]) => Promise<void>, name: string);
    collect(data: object): void;
    store(): Promise<void>;
}

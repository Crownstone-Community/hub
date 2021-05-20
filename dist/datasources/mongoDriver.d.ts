export declare class MongoDbConnector {
    db: any;
    mongoClient: null;
    connect(): Promise<void>;
    close(): Promise<void>;
}

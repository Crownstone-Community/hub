import { ValueOrPromise } from '@loopback/core';
import { juggler, AnyObject } from '@loopback/repository';
export declare class MongoDataSource extends juggler.DataSource {
    static dataSourceName: string;
    constructor(dsConfig?: AnyObject);
    /**
     * Disconnect the datasource when application is stopped. This allows the
     * application to be shut down gracefully.
     */
    stop(): ValueOrPromise<void>;
}

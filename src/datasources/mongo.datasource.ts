import {inject, lifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {juggler, AnyObject} from '@loopback/repository';
import MongoDbConfig from './mongo.datasource.config'

@lifeCycleObserver('datasource')
export class MongoDataSource extends juggler.DataSource {
  static dataSourceName = 'mongo';

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: AnyObject = MongoDbConfig,
  ) {
    super(dsConfig);
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}

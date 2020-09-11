const MongoClient = require('mongodb').MongoClient;
import MongoDbConfig from './mongo.datasource.config'


export class MongoDbConnector {

  db : any = null;
  mongoClient = null;

  async connect() {
    let url = 'mongodb://' + MongoDbConfig.host + ":" + MongoDbConfig.port;
    // Database Name
    const dbName = MongoDbConfig.database;
    const client = new MongoClient(url, { useUnifiedTopology: true });

    // Use connect method to connect to the Server
    await client.connect();

    this.db = client.db(dbName);
  }

  async close() {
    if (this.mongoClient) {
      // @ts-ignore
      await this.mongoClient.close()
    }
    console.log(Date.now() + " Connector: Connection to mongo server closed.");
  }
}


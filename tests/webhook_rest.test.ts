import path from 'path';
import {CrownstoneHubApplication} from '../src';
import {Client, createRestAppClient} from '@loopback/testlab';
import {clearTestDatabase, createApp} from './helpers';
import {auth, createHub, createUser} from './dataGenerators';
import {eventBus} from '../src/crownstone/HubEventBus';

let app    : CrownstoneHubApplication;
let client : Client;

beforeEach(async () => { await clearTestDatabase(); })
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);
})
afterAll(async () => { await app.stop(); })


test("Test custom handler and fire it.", async () => {
  createHub()
  createUser()

  let fs = require("fs");
  let code = fs.readFileSync(path.join(__dirname,'./dataGenerators/customHandlerSmallExample.js'), 'utf-8');
  await client.post(auth("/webhooks"))
    .send({
      event:            "ASSET_REPORT",
      clientSecret:     "MyWrappy",
      endPoint:         "http://127.0.1.0",
      compressed:       true,
      batchTimeSeconds: 0,
      customHandler: code,
      apiKey:           "ABCdE",
      apiKeyHeader:     "x-api-key"
    })
    .expect(({body}) => {

    })

  await client.get(auth("/webhooks"))
    .expect(({body}) => {
      expect(body[0].customHandlerIssue).toBe("Not executed yet...")
    })

  // Start a webserver at localhost:5000 and see the result come in.
  eventBus.emit("__ASSET_REPORT", {
      macAddress:   'ab:cd:ef:ge:de:ga',
      crownstoneId: 1,
      rssi:         -32,
      channel:      37,
    }
  );

  // give it some time to execute.
  setTimeout(async () => {
    await client.get(auth("/webhooks"))
      .expect(({body}) => {
        expect(body[0].customHandlerIssue.substr(0, 24)).toBe("Executed successfully on")
      })
  }, 200)
})
test("Test invalid custom handler giving error.", async () => {
  createHub()
  createUser()

  let fs = require("fs");
  let code = fs.readFileSync(path.join(__dirname,'./dataGenerators/customHandlerSmallExample_invalid.js'), 'utf-8');
  await client.post(auth("/webhooks"))
    .send({
      event:            "ASSET_REPORT",
      clientSecret:     "MyWrappy",
      endPoint:         "http://127.0.1.0",
      compressed:       true,
      batchTimeSeconds: 0,
      customHandler: code,
      apiKey:           "ABCdE",
      apiKeyHeader:     "x-api-key"
    })
    .expect(({body}) => {
      expect(body?.error?.statusCode).toBe(400)
    })
})
test("Test custom handler giving error when called.", async () => {
  createHub()
  createUser()

  let fs = require("fs");
  let code = fs.readFileSync(path.join(__dirname,'./dataGenerators/customHandlerSmallExample_crashing.js'), 'utf-8');
  await client.post(auth("/webhooks"))
    .send({
      event:            "ASSET_REPORT",
      clientSecret:     "MyWrappy",
      endPoint:         "http://127.0.1.0",
      compressed:       true,
      batchTimeSeconds: 0,
      customHandler: code,
      apiKey:           "ABCdE",
      apiKeyHeader:     "x-api-key"
    })
    .expect(({body}) => {

    })

  // Start a webserver at localhost:5000 and see the result come in.
  eventBus.emit("__ASSET_REPORT", {
      macAddress:   'ab:cd:ef:ge:de:ga',
      crownstoneId: 1,
      rssi:         -32,
      channel:      37,
    }
  );

  await client.get(auth("/webhooks"))
    .expect(({body}) => {
      expect(body[0].customHandlerIssue).toBe("Error while executing: Failed something.")
    })
})
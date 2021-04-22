import {clearTestDatabase, createApp} from './helpers';
import {CrownstoneHubApplication} from '../src';
import {Client, createRestAppClient} from '@loopback/testlab';
import {EMPTY_DATABASE} from '../src/crownstone/Data/DbUtil';
import { mocked } from 'ts-jest/utils'
import {auth, createHub, createUser} from './dataGenerators';
//
// const log = Logger("EnergyCollectionTest");
// log.config.setConsoleLevel('debug')

let app    : CrownstoneHubApplication;
let client : Client;

beforeEach(async () => {
  mocked(EMPTY_DATABASE).mockReset();
  await clearTestDatabase(); })
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);
})
afterAll(async () => { await app.stop(); })

test("Create assets.", async () => {
  await createHub();
  await createUser()

  await client.get(auth("/assets"))
    .expect(200)
    .expect(({body}) => { expect(body).toStrictEqual([]); })

  await client.post(auth("/assets"))
    .expect(200)
    .send({
      inputData: {type:'MAC_ADDRESS'},
      outputDescription: {type:'REPORT',representation:'FULL_MAC_ADDRESS_RSSI'},
      data: "8ca26201"
    })
    .expect(({body}) => {
      console.log("body", body)
    })
});

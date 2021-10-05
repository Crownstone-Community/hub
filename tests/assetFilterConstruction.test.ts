import {mocks, resetMocks} from './mocks/suite.mock';
import {clearTestDatabase, createApp} from './helpers';
import {CrownstoneHubApplication} from '../src';
import {Client, createRestAppClient} from '@loopback/testlab';
import {EMPTY_DATABASE} from '../src/crownstone/data/DbUtil';
import {mocked } from 'ts-jest/utils'
import {auth, createAsset_ad_track_ad, createAsset_mac_report, createHub, createUser} from './dataGenerators';
import {Dbs} from '../src/crownstone/data/DbReference';
import {FilterManager} from '../src/crownstone/filters/FilterManager';

let app    : CrownstoneHubApplication;
let client : Client;

beforeEach(async () => {
  mocked(EMPTY_DATABASE).mockReset();
  await clearTestDatabase(); })
  resetMocks()
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);
})
afterAll(async () => { await app.stop(); })


test("Create assets via REST", async () => {
  await createHub();
  await createUser();

  mocks.uart._loadQueue({supportedFilterProtocol:0}, 3);

  await client.get(auth("/assets"))
    .expect(200)
    .expect(({body}) => { expect(body).toStrictEqual([]); })

  await client.post(auth("/assets"))
    .expect(200)
    .send({
      inputData: {type:'MAC_ADDRESS'},
      outputDescription: {type:'MAC_ADDRESS_REPORT'},
      data: "8c62a201"
    })
    .expect(({body}) => {
     expect(body).toStrictEqual({
       updatedAt: "1970-01-01T00:16:40.000Z",
       createdAt: "1970-01-01T00:16:40.000Z",
       id: '1',
       committed: false,
       exclude: false,
       markedForDeletion: false,
       inputData: { type: 'MAC_ADDRESS' },
       outputDescription: {type:'MAC_ADDRESS_REPORT'},
       data: '8c62a201'
     })
    })

  await client.post(auth("/assets/commit"))
    .expect(204)
});

test("Create assets directly", async () => {
  await createAsset_mac_report();
  await createAsset_mac_report();
  await createAsset_mac_report();
  await createAsset_mac_report();
  await createAsset_mac_report();
  await createAsset_mac_report();
  await createAsset_ad_track_ad();
  await createAsset_ad_track_ad();
  await createAsset_ad_track_ad();
  await createAsset_ad_track_ad();
  await createAsset_ad_track_ad();
  await createAsset_ad_track_ad(51);

  mocks.uart._loadQueue({supportedFilterProtocol:0});
  let changeRequired = await FilterManager.reconstructFilters();
  expect(changeRequired).toBeTruthy();

  let filtersNow = await Dbs.assetFilters.find();
  expect(filtersNow.length).toBe(3)
});

test("Create assets and remove them after, see if filtersets are updated when everything is removed.", async () => {
  await createAsset_mac_report(23);
  await createAsset_mac_report(22);
  await createAsset_mac_report(52);
  await createAsset_mac_report(662);
  await createAsset_mac_report(123);
  await createAsset_mac_report(51);

  mocks.uart._loadQueue({supportedFilterProtocol:0});
  let changeRequired = await FilterManager.reconstructFilters();
  expect(changeRequired).toBeTruthy();
  let filtersNow = await Dbs.assetFilters.find();
  expect(filtersNow.length).toBe(1);

  await FilterManager.refreshFilterSets();
  let setsNow = await Dbs.assetFilterSets.find();
  expect(setsNow.length).toBe(1);
  expect(setsNow[0].masterVersion).toBe(1);
  expect(setsNow[0].masterCRC).toBe(3937753986);

  await Dbs.assets.deleteAll({});
  let assetsNow = await Dbs.assets.find();
  expect(assetsNow.length).toBe(0)

  changeRequired = await FilterManager.reconstructFilters();
  expect(changeRequired).toBeTruthy();
  filtersNow = await Dbs.assetFilters.find();
  expect(filtersNow.length).toBe(0);

  await FilterManager.refreshFilterSets();
  setsNow = await Dbs.assetFilterSets.find();
  expect(setsNow.length).toBe(1);
  expect(setsNow[0].masterVersion).toBe(2);
  expect(setsNow[0].masterCRC).toBe(0);
});

test("Create assets and check if the filters are constructed correctly.", async () => {
  await createAsset_mac_report(0xfdea, "CUCKOO")
  await createAsset_mac_report(0xfd1a, "CUCKOO")
  await createAsset_mac_report(0xfde4, "CUCKOO")
  await createAsset_mac_report(0xfde2, "EXACT_MATCH")
  await createAsset_mac_report(0xfde2DE, "EXACT_MATCH")
  await createAsset_mac_report(0xfd6a)
  await createAsset_mac_report(0x7dea)

  mocks.uart._loadQueue({supportedFilterProtocol:0}, 3);
  let changesRequired = await FilterManager.reconstructFilters();
  expect(changesRequired).toBeTruthy();

  let filters = await Dbs.assetFilters.find();
  expect(filters.length).toBe(3)

  changesRequired = await FilterManager.reconstructFilters();
  expect(changesRequired).toBeFalsy();

  await Dbs.assets.deleteAll({});
  let assets = await Dbs.assets.find();
  expect(assets.length).toBe(0);

  changesRequired = await FilterManager.reconstructFilters();
  expect(changesRequired).toBeTruthy();
});

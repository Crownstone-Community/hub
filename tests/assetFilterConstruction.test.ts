import {resetMocks} from './mocks/suite.mock';
import {clearTestDatabase, createApp} from './helpers';
import {CrownstoneHubApplication} from '../src';
import {Client, createRestAppClient} from '@loopback/testlab';
import {EMPTY_DATABASE} from '../src/crownstone/data/DbUtil';
import { mocked } from 'ts-jest/utils'
import {auth, createAsset_ad_track_ad, createAsset_mac_report, createHub, createUser} from './dataGenerators';
import {Dbs} from '../src/crownstone/data/DbReference';
import {FilterManager} from '../src/crownstone/filters/FilterManager';
import {FilterUtil} from '../src/crownstone/filters/FilterUtil';
import set = Reflect.set;



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
  await createUser()

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

  let changeRequired = await FilterManager.reconstructFilters();
  expect(changeRequired).toBeTruthy();

  let assetsNow = await Dbs.assets.find();
  let filtersNow = await Dbs.assetFilters.find();
  expect(filtersNow.length).toBe(3)

  let filterCategories = {}
  for (let filter of filtersNow) {
    filterCategories[FilterUtil.getMetaDataDescriptionFromFilter(filter)] = filter;
  }

  for (let asset of assetsNow) {
    let filterId = filterCategories[FilterUtil.getMetaDataDescriptionFromAsset(asset)].id;
    expect(asset.filterId).toBe(filterId);
  }
});

test("Create assets and remove them after, see if filtersets are updated when everything is removed.", async () => {
  await createAsset_mac_report(23);
  await createAsset_mac_report(22);
  await createAsset_mac_report(52);
  await createAsset_mac_report(662);
  await createAsset_mac_report(123);
  await createAsset_mac_report(51);

  let changeRequired = await FilterManager.reconstructFilters();
  expect(changeRequired).toBeTruthy();
  let filtersNow = await Dbs.assetFilters.find();
  expect(filtersNow.length).toBe(1);

  await FilterManager.refreshFilterSets();
  let setsNow = await Dbs.assetFilterSets.find();
  expect(setsNow.length).toBe(1);
  console.log(setsNow)
  expect(setsNow[0].masterVersion).toBe(1);
  expect(setsNow[0].masterCRC).toBe(21346);

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
  expect(setsNow[0].masterCRC).toBe(65535);
});

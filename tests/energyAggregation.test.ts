import {EnergyMonitor} from '../src/crownstone/MeshMonitor/EnergyMonitor';
import {clearTestDatabase, createApp} from './helpers';
import {CrownstoneHubApplication} from '../src';
import {Client, createRestAppClient} from '@loopback/testlab';
import {Dbs} from '../src/crownstone/Data/DbReference';
import {IntervalData} from '../src/crownstone/Processing/IntervalData';

const fs = require("fs");
const path = require("path");
// import {Logger} from '../src/Logger';
//
// const log = Logger("EnergyCollectionTest");
// log.config.setConsoleLevel('debug')

let app    : CrownstoneHubApplication;
let client : Client;

beforeEach(async () => { await clearTestDatabase(); })
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);
})
afterAll(async () => { await app.stop(); })


test("check processing energy data without interpolation", async () => {
  let monitor = new EnergyMonitor();

  function m(x,a) { return new Date('2020-01-01 01:00:00Z').valueOf() + x*60*1000 + a*1000}

  let content = fs.readFileSync( path.join(__dirname, 'data_input','aggregationData.json'));

  let arr = JSON.parse(content);
  let store = [];
  let counter = 0;
  for (let item of arr) {
    store.push({stoneUID: 1, energyUsage: item.energyUsage, timestamp: new Date(item.timestamp), uploaded: false})
    counter += 1;
    if (counter > 1000) {
      break
    }
  }
  await Dbs.energyProcessed.createAll(store)
  let count_1m = (await Dbs.energyProcessed.count()).count
  // console.time("processAggregations")
  await monitor.processAggregations()
  // console.timeEnd("processAggregations")
  let count_5m  = (await Dbs.energyProcessed.count({interval:'5m'})).count;
  let count_10m = (await Dbs.energyProcessed.count({interval:'10m'})).count;
  let count_15m = (await Dbs.energyProcessed.count({interval:'15m'})).count;
  let count_30m = (await Dbs.energyProcessed.count({interval:'30m'})).count;
  let count_1h  = (await Dbs.energyProcessed.count({interval:'1h'})).count;
  let count_3h  = (await Dbs.energyProcessed.count({interval:'3h'})).count;
  let count_6h  = (await Dbs.energyProcessed.count({interval:'6h'})).count;
  let count_12h = (await Dbs.energyProcessed.count({interval:'12h'})).count;
  let count_1d  = (await Dbs.energyProcessed.count({interval:'1d'})).count;
  let count_1w  = (await Dbs.energyProcessed.count({interval:'1w'})).count;

  expect(count_5m).toBeGreaterThanOrEqual(Math.floor(count_1m/5));
  expect(count_10m).toBeGreaterThanOrEqual(Math.floor(count_5m/2));
  expect(count_15m).toBeGreaterThanOrEqual(Math.floor(count_5m/3));
  expect(count_30m).toBeGreaterThanOrEqual(Math.floor(count_15m/2));
  expect(count_1h).toBeGreaterThanOrEqual(Math.floor(count_30m/2));
  expect(count_3h).toBeGreaterThanOrEqual(Math.floor(count_1h/3));
  expect(count_6h).toBeGreaterThanOrEqual(Math.floor(count_3h/2));
  expect(count_12h).toBeGreaterThanOrEqual(Math.floor(count_6h/2));
  expect(count_1d).toBeGreaterThanOrEqual(Math.floor(count_12h/2));
  expect(count_1w).toBeGreaterThanOrEqual(Math.floor(count_1d/7));
  //
  // console.log(
  //   count_1m,
  //   count_5m,
  //   count_10m,
  //   count_15m,
  //   count_30m,
  //   count_1h,
  //   count_3h,
  //   count_6h,
  //   count_12h,
  //   count_1d,
  //   count_1w,
  // );
});

async function saveData(interval: string) {
  // console.time("Store"+interval);
  let crownstoneUID = 1;
  let from = new Date("2020").toISOString()
  let until = new Date("2022").toISOString()
  let limit = 5000000

  let useInterval = '1m'
  if (interval === '1m' || IntervalData[interval] !== undefined) {
    useInterval = interval;
  }

  let filters : any[] = [{stoneUID:crownstoneUID, interval: useInterval }];
  if (from)  { filters.push({timestamp:{gte: from}})  }
  if (until) { filters.push({timestamp:{lte: until}}) }

  let query = {where: {and: filters}, limit: limit, fields:{energyUsage: true, timestamp: true}, order: 'timestamp ASC'}

  // @ts-ignore
  // let processed = await Dbs.energyProcessed.find(query);
  // let str = '[\n';
  // for (let data of processed) {
  //   str += "  " + JSON.stringify(data) + ",\n"
  // }
  // str += "\n]"
  // fs.writeFileSync(path.join(__dirname, 'data_result', `data_${interval}.json`), str)
  // console.timeEnd("Store"+interval);
}
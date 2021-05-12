import {EnergyMonitor} from '../src/crownstone/meshMonitor/EnergyMonitor';
import {clearTestDatabase, createApp} from './helpers';
import {CrownstoneHubApplication} from '../src';
import {Client, createRestAppClient} from '@loopback/testlab';
import {Dbs} from '../src/crownstone/data/DbReference';
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


const fs = require('fs')
const path = require('path')
test("try to process data", async () => {
  // let data = require("./data_input/input.json");
  // let monitor = new EnergyMonitor();
  // let usedData = [];
  // data.sort((a,b) => { return new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf()})
  // for (let i = 0; i < data.length; i++) {
  //   usedData.push(data[i]);
  //   if (i === 10) { break; }
  // }

  // for (let i = 0; i < usedData.length; i++) {
  //   let dp = usedData[i];
  //   await monitor.collect(dp.stoneUID, dp.energyUsage, dp.pointPowerUsage, new Date(dp.timestamp).valueOf() + 3600000*2);
  // }

  // console.time("process")
  // await monitor.processMeasurements()
  // console.timeEnd("process")

  // let processedPoints = await Dbs.energyProcessed.find()
  // processedPoints.sort((a,b) => { return new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf()})
  // let str = "[\n  " + JSON.stringify(processedPoints[0])
  // for (let j = 1; j < processedPoints.length; j++) {
  //   str += ",\n  " + JSON.stringify(processedPoints[j])
  // }
  // str += "\n]"
  // fs.writeFileSync(path.join(__dirname,"result.json"), str);
});

test("try to process data from hub", async () => {
  let data = require("./data_input/testData.json");
  let monitor = new EnergyMonitor();
  let usedData = [];
  data.sort((a,b) => { return new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf()})
  for (let i = 0; i < data.length; i++) {
    usedData.push(data[i]);
    if (i === 100) { break; }
  }


  // console.time("Load")
  for (let i = 0; i < usedData.length; i++) {
    let dp = usedData[i];
    await monitor.collect(dp.stoneUID, dp.energyUsage, dp.pointPowerUsage, new Date(dp.timestamp).valueOf() + 3600000*2);
  }
  // console.timeEnd("Load")

  // console.time("process")
  await monitor.processMeasurements()
  // console.timeEnd("process")

  let processedPoints = await Dbs.energyProcessed.find()
  processedPoints.sort((a,b) => { return new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf()})
  let str = "[\n  " + JSON.stringify(processedPoints[0])
  for (let j = 1; j < processedPoints.length; j++) {
    str += ",\n  " + JSON.stringify(processedPoints[j])
  }
  str += "\n]"
  fs.writeFileSync(path.join(__dirname,"result.json"), str);
});
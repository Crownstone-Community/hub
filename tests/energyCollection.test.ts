import {EnergyMonitor} from '../src/crownstone/MeshMonitor/EnergyMonitor';
import {clearTestDatabase, createApp} from './helpers';
import {CrownstoneHubApplication} from '../src';
import {Client, createRestAppClient} from '@loopback/testlab';
import {DbRef} from '../src/crownstone/Data/DbReference';
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

  await monitor.collect(1, 1000, 5, m(0,0))
  await monitor.collect(1, 2000, 5, m(1,0))

  await monitor.processMeasurements()

  let processedPoints = await DbRef.energyProcessed.find()
  expect(processedPoints.length).toBe(2)
  expect(processedPoints[0].energyUsage).toBe(1000)
  expect(processedPoints[1].energyUsage).toBe(2000)
});


test("check processing energy data without interpolation WITH a gap", async () => {
  let monitor = new EnergyMonitor();

  function m(x,a) { return new Date('2020-01-01 01:00:00Z').valueOf() + x*60*1000 + a*1000}

  await monitor.collect(1, 1000, 5, m(0,0))
  await monitor.collect(1, 2000, 5, m(1,0))
  await monitor.collect(1, 3000, 5, m(8,0))

  await monitor.processMeasurements()

  await monitor.collect(1, 4000, 5, m(9,0))

  await monitor.processMeasurements()

  let processedPoints = await DbRef.energyProcessed.find()
  expect(processedPoints.length).toBe(4)
});


test("check processing energy data without interpolation WITH a gap 2", async () => {
  let monitor = new EnergyMonitor();

  function m(x,a) { return new Date('2020-01-01 01:00:00Z').valueOf() + x*60*1000 + a*1000}

  await monitor.collect(1, 1000, 5, m(0,0))
  await monitor.collect(1, 2000, 5, m(1,0))
  await monitor.collect(1, 3000, 5, m(8,0))
  await monitor.collect(1, 4000, 5, m(9,0))

  await monitor.processMeasurements()

  let processedPoints = await DbRef.energyProcessed.find()


  expect(processedPoints.length).toBe(4)
});


test("check processing energy data in normal situation", async () => {
  let monitor = new EnergyMonitor();

  function m(x,a) { return new Date('2020-01-01 01:00:00Z').valueOf() + x*60*1000 + a*1000}

  await monitor.collect(1, 1000, 5, m(0,1))
  await monitor.collect(1, 2000, 5, m(1,4))
  await monitor.collect(1, 3000, 5, m(2,0))
  await monitor.collect(1, 4000, 5, m(5,4))

  await monitor.processMeasurements()

  let energyPoints    = await DbRef.energy.find();
  let processedPoints = await DbRef.energyProcessed.find()
  expect(processedPoints[0].energyUsage).toBe(Math.round((1000/63)*59+1000));
  expect(processedPoints[1].energyUsage).toBe(3000);
  expect(processedPoints[2].energyUsage).toBe(Math.round((1000/184)*60 + 3000));
  expect(processedPoints[3].energyUsage).toBe(Math.round((1000/184)*120 + 3000));
  expect(processedPoints[4].energyUsage).toBe(Math.round((1000/184)*180 + 3000));

  for (let i = 0; i < energyPoints.length-1;i++) {
    expect(energyPoints[i].processed).toBe(true);
  }
  expect(energyPoints[energyPoints.length -1].processed).toBe(true);
});


test("check reboot detection and handling", async () => {
  let monitor = new EnergyMonitor();

  function m(x,a) { return new Date('2020-01-01 01:00:00Z').valueOf() + x*60*1000 + a*1000}

  await monitor.collect(1, 1000, 5, m(0,1))
  await monitor.collect(1, 0, 5, m(2,4))
  await monitor.collect(1, 3000, 5, m(4,0))

  await monitor.processMeasurements()

  let processedPoints = await DbRef.energyProcessed.find();
  expect(processedPoints[0].energyUsage).toBe(1000);
  expect(processedPoints[1].energyUsage).toBe(1000);
  expect(processedPoints[2].energyUsage).toBe(Math.round((3000/116)*56) + 1000);
  expect(processedPoints[3].energyUsage).toBe(3000 + 1000);
});


test("check large gap", async () => {
  let monitor = new EnergyMonitor();

  function m(x,a) { return new Date('2020-01-01 01:00:00Z').valueOf() + x*60*1000 + a*1000}

  await monitor.collect(1, 1000, 5, m(0,1))
  await monitor.collect(1, 2000, 5, m(1,1))
  await monitor.collect(1, 3000, 5, m(9,0))
  await monitor.collect(1, 4000, 5, m(10,0))

  await monitor.processMeasurements()
  let processedPoints = await DbRef.energyProcessed.find()
  expect(processedPoints.length).toBe(3)
});


test("check resuming after zero measurement gap", async () => {
  let monitor = new EnergyMonitor();

  function m(x,a) { return new Date('2020-01-01 01:00:00Z').valueOf() + x*60*1000 + a*1000}

  await monitor.collect(1, 1000, 5, m(0,0))
  await monitor.collect(1, 0, 5, m(1,1))

  await monitor.processMeasurements()

  await monitor.collect(1, 3000, 5, m(9,0))
  await monitor.collect(1, 4000, 5, m(10,0))

  await monitor.processMeasurements()
  let processedPoints = await DbRef.energyProcessed.find()
  expect(processedPoints[0].energyUsage).toBe(1000);
  expect(processedPoints[1].energyUsage).toBe(1000);
  expect(processedPoints[2].energyUsage).toBe(3000 + 1000);
  expect(processedPoints[3].energyUsage).toBe(4000 + 1000);

});



test("check double reboot gap", async () => {
  let monitor = new EnergyMonitor();

  function m(x,a) { return new Date('2020-01-01 01:00:00Z').valueOf() + x*60*1000 + a*1000}

  await monitor.collect(1, 40000, 5, m(0,0));   // 40000
  await monitor.collect(1, 0, 5, m(1,1));       // 40000
  await monitor.collect(1, 3000, 5, m(2,0));    // 43000
  await monitor.collect(1, 4000, 5, m(3,0));    // 44000
  await monitor.collect(1, 20000, 5, m(4,0));   // 60000
  await monitor.collect(1, 0, 5, m(5,1));       // 60000
  await monitor.collect(1, 3000, 5, m(6,0));    // 63000
  await monitor.collect(1, 4000, 5, m(7,0));    // 64000
  await monitor.collect(1, 20000, 5, m(8,0));   // 80000

  await monitor.processMeasurements()
  let processedPoints = await DbRef.energyProcessed.find()
  expect(processedPoints[0].energyUsage).toBe(40000);
  expect(processedPoints[1].energyUsage).toBe(40000);
  expect(processedPoints[2].energyUsage).toBe(43000);
  expect(processedPoints[3].energyUsage).toBe(44000);
  expect(processedPoints[4].energyUsage).toBe(60000);
  expect(processedPoints[5].energyUsage).toBe(60000);
  expect(processedPoints[6].energyUsage).toBe(63000);
  expect(processedPoints[7].energyUsage).toBe(64000);
  expect(processedPoints[8].energyUsage).toBe(80000);
});



test("check double reboot gap with not exactly zero numbers", async () => {
  let monitor = new EnergyMonitor();

  function m(x,a) { return new Date('2020-01-01 01:00:00Z').valueOf() + x*60*1000 + a*1000}

  await monitor.collect(1, 40000, 5, m(0,0));   // 40000
  await monitor.collect(1, 200, 5, m(1,0));     // 40000
  await monitor.collect(1, 3000, 5, m(2,0));    // 43000
  await monitor.collect(1, 4000, 5, m(3,0));    // 44000
  await monitor.collect(1, 20000, 5, m(4,0));   // 60000
  await monitor.collect(1, 260, 5, m(5,0));     // 60000
  await monitor.collect(1, 3000, 5, m(6,0));    // 63000
  await monitor.collect(1, 4000, 5, m(7,0));    // 64000
  await monitor.collect(1, 20000, 5, m(8,0));   // 80000

  await monitor.processMeasurements()
  let processedPoints = await DbRef.energyProcessed.find()
  expect(processedPoints[0].energyUsage).toBe(40000);
  expect(processedPoints[1].energyUsage).toBe(200   + 40000);
  expect(processedPoints[2].energyUsage).toBe(3000  + 40000);
  expect(processedPoints[3].energyUsage).toBe(4000  + 40000);
  expect(processedPoints[4].energyUsage).toBe(20000 + 40000);
  expect(processedPoints[5].energyUsage).toBe(260   + 20000 + 40000);
  expect(processedPoints[6].energyUsage).toBe(3000  + 20000 + 40000);
  expect(processedPoints[7].energyUsage).toBe(4000  + 20000 + 40000);
  expect(processedPoints[8].energyUsage).toBe(20000 + 20000 + 40000);
});



test("check duplicate handling", async () => {
  let monitor = new EnergyMonitor();

  function m(x,a) { return new Date('2020-01-01 01:00:00Z').valueOf() + x*60*1000 + a*1000}

  await monitor.collect(1, 1000, 5, m(1,0))
  await monitor.collect(1, 3000, 5, m(2,0))
  await monitor.collect(1, 3000, 5, m(2,0))
  await monitor.collect(1, 3000, 5, m(2,0))
  await monitor.collect(1, 4000, 5, m(3,0))

  await monitor.processMeasurements()
  let processedPoints = await DbRef.energyProcessed.find()
  expect(processedPoints.length).toBe(3)
});


// const fs = require('fs')
// const path = require('path')
// test("try to process data", async () => {
//   let data = require("../__development/test.json");
//   let monitor = new EnergyMonitor();
//   let usedData = [];
//   data.sort((a,b) => { return new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf()})
//   for (let i = 0; i < data.length; i++) {
//     usedData.push(data[i]);
//     if (i === 4000) { break; }
//   }
//
//   for (let i = 0; i < usedData.length; i++) {
//     let dp = usedData[i];
//     await monitor.collect(dp.stoneUID, dp.energyUsage, dp.pointPowerUsage, new Date(dp.timestamp).valueOf());
//   }
//
//   console.time("process")
//   await monitor.processMeasurements()
//   console.timeEnd("process")
//
//   let processedPoints = await DbRef.energyProcessed.find()
//   processedPoints.sort((a,b) => { return new Date(a.timestamp).valueOf() - new Date(b.timestamp).valueOf()})
//   let str = "[\n  " + JSON.stringify(processedPoints[0])
//   for (let j = 1; j < processedPoints.length; j++) {
//     str += ",\n  " + JSON.stringify(processedPoints[j])
//   }
//   str += "\n]"
//   fs.writeFileSync(path.join(__dirname,"data.json"), str);
// });
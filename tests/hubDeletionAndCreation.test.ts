import {clearTestDatabase, createApp} from './helpers';
import {CrownstoneHubApplication} from '../src';
import {Client, createRestAppClient} from '@loopback/testlab';
import {Dbs} from '../src/crownstone/data/DbReference';
import {EMPTY_DATABASE} from '../src/crownstone/data/DbUtil';
import { mocked } from 'ts-jest/utils'
// import {Logger} from '../src/Logger';
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

test("Create and partially delete a hub without losing data when creating a hubs in the same sphere.", async () => {
  await Dbs.hub.create({
    token:'token',
    cloudId:'cloudId',
    name:'name',
    uartKey:'uartKey',
    accessToken:'accessToken',
    accessTokenExpiration:0,
    linkedStoneId:'linkedStoneId',
    sphereId:'sphereId',
  });

  await Dbs.energy.create({
    stoneUID: 42,
    energyUsage:64,
  });

  expect(await Dbs.hub.isSet()).toBe(true);
  expect(await Dbs.energy.count({})).toStrictEqual({count:1});

  await Dbs.hub.partialDelete();

  let hub = await Dbs.hub.get();
  expect(await Dbs.hub.isSphereSet()).toBe(true);
  expect(hub.token).toBe('');
  expect(hub.cloudId).toBe('');
  expect(hub.name).toBe('');
  expect(hub.uartKey).toBe('');
  expect(hub.accessToken).toBe('');
  expect(hub.accessTokenExpiration.toISOString()).toBe(new Date(0).toISOString());
  expect(hub.linkedStoneId).toBe('');

  expect(await Dbs.energy.count({})).toStrictEqual({count:1});
  await Dbs.hub.create({
    token:'token2',
    cloudId:'cloudId2',
    name:'name2',
    uartKey:'uartKey2',
    accessToken:'accessToken2',
    accessTokenExpiration:0,
    linkedStoneId:'linkedStoneId2',
    sphereId:'sphereId',
  });
  expect(await Dbs.energy.count({})).toStrictEqual({count:1});
  expect(EMPTY_DATABASE).toHaveBeenCalledTimes(0)
});


test("Create and partially delete a hub and clearing data when creating in a different sphere.", async () => {
  await Dbs.hub.create({
    token:'token',
    cloudId:'cloudId',
    name:'name',
    uartKey:'uartKey',
    accessToken:'accessToken',
    accessTokenExpiration:0,
    linkedStoneId:'linkedStoneId',
    sphereId:'sphereId',
  });

  await Dbs.energy.create({
    stoneUID: 42,
    energyUsage:64,
  });

  expect(await Dbs.hub.isSet()).toBe(true);
  expect(await Dbs.energy.count({})).toStrictEqual({count:1});

  await Dbs.hub.partialDelete();

  expect(await Dbs.hub.isSphereSet()).toBe(true);

  expect(await Dbs.energy.count({})).toStrictEqual({count:1});
  await Dbs.hub.create({
    token:'token2',
    cloudId:'cloudId2',
    name:'name2',
    uartKey:'uartKey2',
    accessToken:'accessToken2',
    accessTokenExpiration:0,
    linkedStoneId:'linkedStoneId2',
    sphereId:'OTHER SPHERE',
  });
  expect(EMPTY_DATABASE).toHaveBeenCalledTimes(1)
});
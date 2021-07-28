import {Dbs} from './data/DbReference';
import {Logger} from '../Logger';
import {resetHubStatus} from './HubStatus';
import {eventBus} from './HubEventBus';
import {topics} from './topics';
import {getStoneIdFromMacAdddress} from './data/MemoryDb';
import {HttpErrors} from '@loopback/rest';
import {CrownstoneHub} from './CrownstoneHub';

const log = Logger(__filename);


export class CrownstoneUtil {

  static async checkLinkedStoneId() {
    let hub = await Dbs.hub.get();
    log.info("Checking linked stoneId...", CrownstoneHub.cloud.initialized, await Dbs.hub.isSet(), hub)
    if (hub && CrownstoneHub.cloud.initialized && await Dbs.hub.isSet() !== false) {
      let macAddress;
      try {
        macAddress = await CrownstoneHub.uart.connection.config.getMacAddress();
        log.info("Obtained MAC Address", macAddress)
        let linkedStoneId = getStoneIdFromMacAdddress(macAddress as string);
        if (String(hub.linkedStoneId) !== String(linkedStoneId)) {
          hub.linkedStoneId = linkedStoneId;
          // @ts-ignore
          await CrownstoneHub.cloud.cloud.hub().update({linkedStoneId: linkedStoneId});
          await Dbs.hub.update(hub);
        }
      } catch (err) {
        if (err?.statusCode === 404) {
          await CrownstoneHub.cloud.sync()
          // if we synced, and still cant find the dongle, we will reset the hub
          let linkedStoneId = getStoneIdFromMacAdddress(macAddress as string);
          if (!linkedStoneId) {
            log.warn("Crownstone USB Instance does not exist in the cloud anymore. Resetting hub...");
            await CrownstoneUtil.deleteCrownstoneHub(true);
            throw "RESET"
          }
        }
        log.warn("Could not set linkedStoneId...", err);
      }
    }
  }

  /**
   * @param partial | If true, the energy data will be retained. Once a new hub is setup and it belongs to a different sphere
   *                           the energy data will be cleared anyway. This is the default method.
*                     If partial is false, the full database will be cleared.
   * @param hubOnly | If true, the uart dongle will also be placed back in setup mode. If false, only the hub snap will be reset
   */
  static async deleteCrownstoneHub(partial: boolean = false, hubOnly: boolean = false) : Promise<string> {
    if (await Dbs.hub.isSet() === true) {
      // make sure all the pending cloud issues are finished before we remove everything.
      await CrownstoneHub.cloud.cleanup();

      let hub = await Dbs.hub.get();
      resetHubStatus();

      let hubExists = false;
      if (hub) {
        try {
          await CrownstoneHub.cloud.cloud.hubLogin(hub.cloudId, hub.token);
          hubExists = true;
        }
        catch (err) {
          hubExists = false;
          console.log("FAILED", err)
        }
      }


      if (hubExists && hub?.linkedStoneId && !hubOnly) {
        try {
          log.notice("Deleting hub linked stone")
          await CrownstoneHub.cloud.cloud.crownstone(hub.linkedStoneId).deleteCrownstone();
          log.notice("Deleting hub linked DONE")
        }
        catch (err) {
          if (err?.statusCode !== 401) {
            log.notice("Deleting hub linked stone failed.", err)
          }
          else {
            log.notice("Deleting hub linked stone failed. Hub permission is presumably revoked.")
          }
        }
      }

      if (!hubOnly) {
        log.notice("Factory resetting dongle.")
        await CrownstoneHub.uart.connection.control.factoryResetCommand()
        log.notice("Factory resetting dongle. DONE")
      }
      else {
        log.notice("Skipping stone factory reset. HubOnly is", hubOnly)
      }

      if (hubExists) {
        try {
          log.notice("Deleting from cloud hub")
          await CrownstoneHub.cloud.cloud.hub().deleteHub();
          log.notice("Deleting hub DONE")
        }
        catch (err) {
          if (err?.statusCode !== 401) {
            log.notice("Deleting hub in cloud failed.", err)
          }
          else {
            log.notice("Deleting hub in cloud failed. Hub permission is presumably revoked.")
          }
        }
      }

      log.notice("Starting cleanup and destroy with partial", partial," ...")
      await CrownstoneHub.cleanupAndDestroy(partial);
      log.notice("Starting cleanup and destroy with partial", partial," ... DONE")

      eventBus.emit(topics.HUB_DELETED);
      log.notice("deleteCrownstoneHub.. DONE", partial, hubOnly);
      return "Success."
    }
    else {
      throw new HttpErrors.NotFound("No Hub to delete..");
    }
  }
}



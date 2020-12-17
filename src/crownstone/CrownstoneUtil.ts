import {Dbs} from './Data/DbReference';
import {Logger} from '../Logger';
import {resetHubStatus} from './HubStatus';
import {eventBus} from './HubEventBus';
import {topics} from './topics';
import {getStoneIdFromMacAdddress} from './Data/MemoryDb';
import {HttpErrors} from '@loopback/rest';
import {CrownstoneHub} from './CrownstoneHub';

const log = Logger(__filename);


export class CrownstoneUtil {

  static async checkLinkedStoneId() {
    let hub = await Dbs.hub.get();
    log.info("Checking linked stoneId...", CrownstoneHub.cloud.initialized, await Dbs.hub.isSet(), hub)
    if (hub && CrownstoneHub.cloud.initialized && await Dbs.hub.isSet() !== false) {
      try {
        let macAddress = await CrownstoneHub.uart.connection.config.getMacAddress();
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
        }
        log.warn("Could not set linkedStoneId...", err);
      }
    }
  }


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


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
      } catch (e) {
        log.warn("Could not set linkedStoneId...", e);
      }
    }
  }


  static async deleteCrownstoneHub(partial: boolean = false) : Promise<string> {
    if (await Dbs.hub.isSet() === true) {
      let hub = await Dbs.hub.get();
      resetHubStatus();

      if (hub?.linkedStoneId) {
        log.notice("Deleting hub linked stone")
        await CrownstoneHub.cloud.cloud.crownstone(hub.linkedStoneId).deleteCrownstone();
        log.notice("Deleting hub linked DONE")
      }

      log.notice("Factory resetting dongle.")
      await CrownstoneHub.uart.connection.control.factoryResetCommand()
      log.notice("Factory resetting dongle. DONE")

      console.log("Deleting hub")
      await CrownstoneHub.cloud.cloud.hub().deleteHub();
      console.log("Deleting hub DONE")

      await CrownstoneHub.cleanupAndDestroy(partial);

      eventBus.emit(topics.HUB_DELETED);
      return "Success."
    }
    else {
      throw new HttpErrors.NotFound("No Hub to delete..");
    }
  }
}



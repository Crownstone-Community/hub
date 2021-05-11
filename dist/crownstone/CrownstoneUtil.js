"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrownstoneUtil = void 0;
const DbReference_1 = require("./data/DbReference");
const Logger_1 = require("../Logger");
const HubStatus_1 = require("./HubStatus");
const HubEventBus_1 = require("./HubEventBus");
const topics_1 = require("./topics");
const MemoryDb_1 = require("./data/MemoryDb");
const rest_1 = require("@loopback/rest");
const CrownstoneHub_1 = require("./CrownstoneHub");
const log = Logger_1.Logger(__filename);
class CrownstoneUtil {
    static async checkLinkedStoneId() {
        let hub = await DbReference_1.Dbs.hub.get();
        log.info("Checking linked stoneId...", CrownstoneHub_1.CrownstoneHub.cloud.initialized, await DbReference_1.Dbs.hub.isSet(), hub);
        if (hub && CrownstoneHub_1.CrownstoneHub.cloud.initialized && await DbReference_1.Dbs.hub.isSet() !== false) {
            let macAddress;
            try {
                macAddress = await CrownstoneHub_1.CrownstoneHub.uart.connection.config.getMacAddress();
                log.info("Obtained MAC Address", macAddress);
                let linkedStoneId = MemoryDb_1.getStoneIdFromMacAdddress(macAddress);
                if (String(hub.linkedStoneId) !== String(linkedStoneId)) {
                    hub.linkedStoneId = linkedStoneId;
                    // @ts-ignore
                    await CrownstoneHub_1.CrownstoneHub.cloud.cloud.hub().update({ linkedStoneId: linkedStoneId });
                    await DbReference_1.Dbs.hub.update(hub);
                }
            }
            catch (err) {
                if (err?.statusCode === 404) {
                    await CrownstoneHub_1.CrownstoneHub.cloud.sync();
                    // if we synced, and still cant find the dongle, we will reset the hub
                    let linkedStoneId = MemoryDb_1.getStoneIdFromMacAdddress(macAddress);
                    if (!linkedStoneId) {
                        log.warn("Crownstone USB Instance does not exist in the cloud anymore. Resetting hub...");
                        await CrownstoneUtil.deleteCrownstoneHub(true);
                        throw "RESET";
                    }
                }
                log.warn("Could not set linkedStoneId...", err);
            }
        }
    }
    static async deleteCrownstoneHub(partial = false, hubOnly = false) {
        if (await DbReference_1.Dbs.hub.isSet() === true) {
            // make sure all the pending cloud issues are finished before we remove everything.
            await CrownstoneHub_1.CrownstoneHub.cloud.cleanup();
            let hub = await DbReference_1.Dbs.hub.get();
            HubStatus_1.resetHubStatus();
            let hubExists = false;
            if (hub) {
                try {
                    await CrownstoneHub_1.CrownstoneHub.cloud.cloud.hubLogin(hub.cloudId, hub.token);
                    hubExists = true;
                }
                catch (err) {
                    hubExists = false;
                    console.log("FAILED", err);
                }
            }
            if (hubExists && hub?.linkedStoneId && !hubOnly) {
                try {
                    log.notice("Deleting hub linked stone");
                    await CrownstoneHub_1.CrownstoneHub.cloud.cloud.crownstone(hub.linkedStoneId).deleteCrownstone();
                    log.notice("Deleting hub linked DONE");
                }
                catch (err) {
                    if (err?.statusCode !== 401) {
                        log.notice("Deleting hub linked stone failed.", err);
                    }
                    else {
                        log.notice("Deleting hub linked stone failed. Hub permission is presumably revoked.");
                    }
                }
            }
            if (!hubOnly) {
                log.notice("Factory resetting dongle.");
                await CrownstoneHub_1.CrownstoneHub.uart.connection.control.factoryResetCommand();
                log.notice("Factory resetting dongle. DONE");
            }
            else {
                log.notice("Skipping stone factory reset. HubOnly is", hubOnly);
            }
            if (hubExists) {
                try {
                    log.notice("Deleting from cloud hub");
                    await CrownstoneHub_1.CrownstoneHub.cloud.cloud.hub().deleteHub();
                    log.notice("Deleting hub DONE");
                }
                catch (err) {
                    if (err?.statusCode !== 401) {
                        log.notice("Deleting hub in cloud failed.", err);
                    }
                    else {
                        log.notice("Deleting hub in cloud failed. Hub permission is presumably revoked.");
                    }
                }
            }
            log.notice("Starting cleanup and destroy with partial", partial, " ...");
            await CrownstoneHub_1.CrownstoneHub.cleanupAndDestroy(partial);
            log.notice("Starting cleanup and destroy with partial", partial, " ... DONE");
            HubEventBus_1.eventBus.emit(topics_1.topics.HUB_DELETED);
            log.notice("deleteCrownstoneHub.. DONE", partial, hubOnly);
            return "Success.";
        }
        else {
            throw new rest_1.HttpErrors.NotFound("No Hub to delete..");
        }
    }
}
exports.CrownstoneUtil = CrownstoneUtil;
//# sourceMappingURL=CrownstoneUtil.js.map
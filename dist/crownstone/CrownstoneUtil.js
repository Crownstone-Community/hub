"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrownstoneUtil = void 0;
const DbReference_1 = require("./Data/DbReference");
const Logger_1 = require("../Logger");
const HubStatus_1 = require("./HubStatus");
const HubEventBus_1 = require("./HubEventBus");
const topics_1 = require("./topics");
const MemoryDb_1 = require("./Data/MemoryDb");
const rest_1 = require("@loopback/rest");
const CrownstoneHub_1 = require("./CrownstoneHub");
const log = Logger_1.Logger(__filename);
class CrownstoneUtil {
    static async checkLinkedStoneId() {
        let hub = await DbReference_1.Dbs.hub.get();
        log.info("Checking linked stoneId...", CrownstoneHub_1.CrownstoneHub.cloud.initialized, await DbReference_1.Dbs.hub.isSet(), hub);
        if (hub && CrownstoneHub_1.CrownstoneHub.cloud.initialized && await DbReference_1.Dbs.hub.isSet() !== false) {
            try {
                let macAddress = await CrownstoneHub_1.CrownstoneHub.uart.connection.config.getMacAddress();
                let linkedStoneId = MemoryDb_1.getStoneIdFromMacAdddress(macAddress);
                if (String(hub.linkedStoneId) !== String(linkedStoneId)) {
                    hub.linkedStoneId = linkedStoneId;
                    // @ts-ignore
                    await CrownstoneHub_1.CrownstoneHub.cloud.cloud.hub().update({ linkedStoneId: linkedStoneId });
                    await DbReference_1.Dbs.hub.update(hub);
                }
            }
            catch (e) {
                log.warn("Could not set linkedStoneId...", e);
            }
        }
    }
    static async deleteCrownstoneHub(partial = false) {
        if (await DbReference_1.Dbs.hub.isSet() === true) {
            let hub = await DbReference_1.Dbs.hub.get();
            HubStatus_1.resetHubStatus();
            if (hub === null || hub === void 0 ? void 0 : hub.linkedStoneId) {
                log.notice("Deleting hub linked stone");
                await CrownstoneHub_1.CrownstoneHub.cloud.cloud.crownstone(hub.linkedStoneId).deleteCrownstone();
                log.notice("Deleting hub linked DONE");
            }
            log.notice("Factory resetting dongle.");
            await CrownstoneHub_1.CrownstoneHub.uart.connection.control.factoryResetCommand();
            log.notice("Factory resetting dongle. DONE");
            console.log("Deleting hub");
            await CrownstoneHub_1.CrownstoneHub.cloud.cloud.hub().deleteHub();
            console.log("Deleting hub DONE");
            await CrownstoneHub_1.CrownstoneHub.cleanupAndDestroy(partial);
            HubEventBus_1.eventBus.emit(topics_1.topics.HUB_DELETED);
            return "Success.";
        }
        else {
            throw new rest_1.HttpErrors.NotFound("No Hub to delete..");
        }
    }
}
exports.CrownstoneUtil = CrownstoneUtil;
//# sourceMappingURL=CrownstoneUtil.js.map
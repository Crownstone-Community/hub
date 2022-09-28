"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UartHubDataCommunication = void 0;
const HubData_1 = require("../../protocol/rx/HubData");
const HubProtocol_1 = require("../../protocol/HubProtocol");
const DbReference_1 = require("../data/DbReference");
const crownstone_cloud_1 = require("crownstone-cloud");
const HubDataReply_1 = require("../../protocol/tx/HubDataReply");
const HubEventBus_1 = require("../HubEventBus");
const topics_1 = require("../topics");
const Logger_1 = require("../../Logger");
const CrownstoneUtil_1 = require("../CrownstoneUtil");
const crownstone_core_1 = require("crownstone-core");
const log = (0, Logger_1.Logger)(__filename);
/**
 * This module handles incoming HubData via uart. It parses and handles the commands. It will also send replies over uart.
 */
class UartHubDataCommunication {
    constructor(uart) {
        this.uart = uart;
    }
    handleIncomingHubData(data) {
        let parsed = new HubData_1.HubDataParser(data.payload);
        if (parsed.valid) {
            if (parsed.result.type === HubProtocol_1.HubDataType.SETUP) {
                this.handleSetup(parsed.result);
            }
            else if (parsed.result.type === HubProtocol_1.HubDataType.REQUEST_DATA) {
                this.handleDataRequest(parsed.result);
            }
            else if (parsed.result.type === HubProtocol_1.HubDataType.FACTORY_RESET) {
                this.handleFactoryResetRequest(parsed.result);
            }
            else if (parsed.result.type === HubProtocol_1.HubDataType.FACTORY_RESET_HUB_ONLY) {
                this.handleFactoryResetHubOnlyRequest(parsed.result);
            }
        }
        else {
            return this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplyError)(HubProtocol_1.HubReplyError.INVALID_MESSAGE), crownstone_core_1.ResultValue.SUCCESS, false);
        }
    }
    async handleSetup(setupPacket) {
        if (await DbReference_1.Dbs.hub.isSet() === false) {
            let cloud = new crownstone_cloud_1.CrownstoneCloud();
            try {
                await cloud.hubLogin(setupPacket.cloudId, setupPacket.token);
            }
            catch (e) {
                // could not log in.
                log.warn("Could not setup, Login failed.", e);
                return this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplyError)(HubProtocol_1.HubReplyError.INVALID_TOKEN), crownstone_core_1.ResultValue.SUCCESS, false);
            }
            try {
                let hubCloudData = await cloud.hub().data();
                await DbReference_1.Dbs.hub.create({
                    name: hubCloudData.name,
                    token: setupPacket.token,
                    cloudId: setupPacket.cloudId,
                    sphereId: hubCloudData.sphereId,
                });
                HubEventBus_1.eventBus.emit(topics_1.topics.HUB_CREATED);
                return this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplySuccess)(), crownstone_core_1.ResultValue.SUCCESS, false);
            }
            catch (e) {
                // could not log in.
                log.warn("Could not setup, something went wrong.", e);
                return this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplyError)(HubProtocol_1.HubReplyError.UNKNOWN), crownstone_core_1.ResultValue.SUCCESS, false);
            }
        }
        else {
            log.warn("Could not setup, this hub is already owned.");
            this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplyError)(HubProtocol_1.HubReplyError.NOT_IN_SETUP_MODE), crownstone_core_1.ResultValue.SUCCESS, false);
        }
    }
    async handleDataRequest(requestPacket) {
        if (requestPacket.requestedType === HubProtocol_1.HubRequestDataType.CLOUD_ID) {
            if (await DbReference_1.Dbs.hub.isSet() === false) {
                return this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplyError)(HubProtocol_1.HubReplyError.IN_SETUP_MODE), crownstone_core_1.ResultValue.SUCCESS, false);
            }
            else {
                if (await DbReference_1.Dbs.hub.isSet()) {
                    let hub = await DbReference_1.Dbs.hub.get();
                    return this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplyString)(requestPacket.requestedType, String(hub?.cloudId)), crownstone_core_1.ResultValue.SUCCESS, false);
                }
                // no hub or no cloudId.
                return this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplyError)(HubProtocol_1.HubReplyError.IN_SETUP_MODE), crownstone_core_1.ResultValue.SUCCESS, false);
            }
        }
    }
    async handleFactoryResetRequest(requestPacket) {
        try {
            log.notice("Factory reset started, notifying dongle...");
            await this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplySuccess)(), crownstone_core_1.ResultValue.SUCCESS, false);
            log.notice("State notified!");
            log.notice("Initiating factory reset procedure...");
            await CrownstoneUtil_1.CrownstoneUtil.deleteCrownstoneHub(true);
            log.notice("Initiated factory reset procedure. Done.");
        }
        catch (e) {
            log.warn("Could not factory reset this hub.", e);
            this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplyError)(HubProtocol_1.HubReplyError.UNKNOWN), crownstone_core_1.ResultValue.SUCCESS, false);
        }
    }
    async handleFactoryResetHubOnlyRequest(requestPacket) {
        try {
            log.notice("Factory reset hub only started, notifying dongle...");
            await this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplySuccess)(), crownstone_core_1.ResultValue.SUCCESS, false);
            log.notice("State notified!");
            log.notice("Initiating factory reset hub only procedure...");
            await CrownstoneUtil_1.CrownstoneUtil.deleteCrownstoneHub(true, true);
            log.notice("Initiated factory reset procedure. Done.");
        }
        catch (e) {
            log.warn("Could not factory reset this hub.", e);
            this.uart.hub.dataReply((0, HubDataReply_1.HubDataReplyError)(HubProtocol_1.HubReplyError.UNKNOWN), crownstone_core_1.ResultValue.SUCCESS, false);
        }
    }
}
exports.UartHubDataCommunication = UartHubDataCommunication;
//# sourceMappingURL=UartHubDataCommunication.js.map
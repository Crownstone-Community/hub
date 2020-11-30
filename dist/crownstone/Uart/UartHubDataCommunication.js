"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UartHubDataCommunication = void 0;
const HubData_1 = require("../../protocol/rx/HubData");
const HubProtocol_1 = require("../../protocol/HubProtocol");
const DbReference_1 = require("../Data/DbReference");
const crownstone_cloud_1 = require("crownstone-cloud");
const HubDataReply_1 = require("../../protocol/tx/HubDataReply");
const HubEventBus_1 = require("../HubEventBus");
const topics_1 = require("../topics");
const Logger_1 = require("../../Logger");
const log = Logger_1.Logger(__filename);
class UartHubDataCommunication {
    constructor(uart) {
        this.uart = uart;
    }
    handleIncomingHubData(data) {
        let parsed = new HubData_1.HubDataParser(data);
        if (parsed.valid) {
            if (parsed.result.type === HubProtocol_1.HubDataType.SETUP) {
                this.handleSetup(parsed.result);
            }
            else if (parsed.result.type === HubProtocol_1.HubDataType.REQUEST_DATA) {
                this.handleDataRequest(parsed.result);
            }
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
                return this.uart.uart.hubDataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.INVALID_TOKEN));
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
                return this.uart.uart.hubDataReply(HubDataReply_1.HubDataReplySuccess());
            }
            catch (e) {
                // could not log in.
                log.warn("Could not setup, something went wrong.", e);
                return this.uart.uart.hubDataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.UNKNOWN));
            }
        }
        else {
            log.info("Could not setup, this hub is already owned.");
            this.uart.uart.hubDataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.NOT_IN_SETUP_MODE));
        }
    }
    async handleDataRequest(requestPacket) {
        if (requestPacket.requestedType === HubProtocol_1.HubRequestDataType.CLOUD_ID) {
            if (await DbReference_1.Dbs.hub.isSet() === false) {
                return this.uart.uart.hubDataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.IN_SETUP_MODE));
            }
            else {
                let hub = await DbReference_1.Dbs.hub.get();
                if (hub === null || hub === void 0 ? void 0 : hub.cloudId) {
                    return this.uart.uart.hubDataReply(HubDataReply_1.HubDataReplyString(requestPacket.requestedType, String(hub === null || hub === void 0 ? void 0 : hub.cloudId)));
                }
                // no hub or no cloudId.
                return this.uart.uart.hubDataReply(HubDataReply_1.HubDataReplyError(HubProtocol_1.HubReplyError.IN_SETUP_MODE));
            }
        }
    }
}
exports.UartHubDataCommunication = UartHubDataCommunication;
//# sourceMappingURL=UartHubDataCommunication.js.map
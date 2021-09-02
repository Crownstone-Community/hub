"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseEventHandler = void 0;
const HubEventBus_1 = require("../HubEventBus");
const topics_1 = require("../topics");
const CrownstoneHub_1 = require("../CrownstoneHub");
const Logger_1 = require("../../Logger");
const ConfigUtil_1 = require("../../util/ConfigUtil");
const log = Logger_1.Logger(__filename);
class SseEventHandler {
    constructor() {
        this.handleSseEvent = (event) => {
            log.debug("Event received: ", event);
            // handle token expired and other system events.
            switch (event.type) {
                case 'system':
                    this.handleSystemEvent(event);
                    break;
                case 'switchStateUpdate':
                    break;
                case 'command':
                    this.handleCommandEvent(event);
                    break;
                case 'dataChange':
                    this.handleDataChangeEvent(event);
                    break;
                case 'sphereTokensChanged':
                    // sync
                    HubEventBus_1.eventBus.emit(topics_1.topics.CLOUD_SYNC_REQUIRED);
                    break;
                case 'abilityChange':
                    // we will get this information over the mesh, not the cloud.
                    break;
                case 'invitationChange':
                    // ignore, token change captures all relevant info for the hub
                    break;
                case 'presence':
                    break;
            }
        };
    }
    handleSystemEvent(event) {
        switch (event.subType) {
            case 'COULD_NOT_REFRESH_TOKEN':
                // login again
                log.notice("Could not refresh hub sse token!");
                HubEventBus_1.eventBus.emit(topics_1.topics.TOKEN_EXPIRED);
                break;
            case 'NO_ACCESS_TOKEN':
            case 'NO_CONNECTION':
                // repeat connection... which is automatic.
                break;
            case 'STREAM_START':
            case 'STREAM_CLOSED':
                break;
        }
    }
    handleCommandEvent(event) {
        switch (event.subType) {
            case 'multiSwitch':
                if (!Array.isArray(event.switchData)) {
                    return;
                }
                let hubConfig = ConfigUtil_1.getHubConfig();
                if (hubConfig.developerOptions.actOnSwitchCommands === false) {
                    return;
                }
                let switchPairs = [];
                event.switchData.forEach((switchData) => {
                    if (switchData.type === 'PERCENTAGE' && switchData.percentage !== undefined) {
                        switchPairs.push({ type: switchData.type, percentage: switchData.percentage, stoneId: switchData.uid });
                    }
                    else if (switchData.type === 'PERCENTAGE') {
                        // if we have no percentage, we just turn it on. this is mostly to silence typescript.
                        switchPairs.push({ type: "TURN_ON", stoneId: switchData.uid });
                    }
                    else {
                        switchPairs.push({ type: switchData.type, stoneId: switchData.uid });
                    }
                });
                if (switchPairs.length > 0) {
                    CrownstoneHub_1.CrownstoneHub.uart.switchCrownstones(switchPairs);
                }
                break;
        }
    }
    handleDataChangeEvent(event) {
        switch (event.subType) {
            case 'stones':
                // sync
                HubEventBus_1.eventBus.emit(topics_1.topics.CLOUD_SYNC_REQUIRED);
                break;
            case 'users':
            // ignore, the token change event is relevant for the hub.
            case 'spheres':
                // ignore
                break;
            case 'locations':
                // ignore
                break;
        }
    }
}
exports.SseEventHandler = SseEventHandler;
//# sourceMappingURL=SseEventHandler.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseEventHandler = void 0;
const HubEventBus_1 = require("../HubEventBus");
const topics_1 = require("../topics");
const CrownstoneHub_1 = require("../CrownstoneHub");
const Logger_1 = require("../../Logger");
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
            case 'TOKEN_EXPIRED':
                // login again
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
            case 'switchCrownstone':
                // switch the crownstone!
                log.info("switchCrownstoneEvent received: ", event);
                let switchState = event.crownstone.switchState;
                if (switchState !== null) {
                    let switchPairs = [];
                    if (switchState > 0 && switchState <= 1) {
                        switchState *= 100;
                    }
                    if (switchState == 100) {
                        switchPairs.push({ type: "TURN_ON", stoneId: event.crownstone.uid });
                    }
                    else {
                        switchPairs.push({ type: "PERCENTAGE", stoneId: event.crownstone.uid, percentage: switchState });
                    }
                    CrownstoneHub_1.CrownstoneHub.uart.switchCrownstones(switchPairs);
                }
                break;
            case 'multiSwitch':
                if (!Array.isArray(event.switchData)) {
                    return;
                }
                let switchPairs = [];
                event.switchData.forEach((switchData) => {
                    switchPairs.push({ type: switchData.type, percentage: switchData.switchState, stoneId: switchData.uid });
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseEventHandler = void 0;
const EventBus_1 = require("../EventBus");
const topics_1 = require("../topics");
const CrownstoneHub_1 = require("../CrownstoneHub");
const LOG = require('debug-level')('crownstone-hub-sse');
class SseEventHandler {
    constructor() {
        this.handleSseEvent = (event) => {
            LOG.debug("Event received: ", event);
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
                    EventBus_1.eventBus.emit(topics_1.topics.CLOUD_SYNC_REQUIRED);
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
                EventBus_1.eventBus.emit(topics_1.topics.TOKEN_EXPIRED);
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
                LOG.info("switchCrownstoneEvent received: ", event);
                let switchState = event.crownstone.switchState;
                if (switchState !== null) {
                    let switchPairs = [];
                    if (switchState == 1) {
                        switchPairs.push({ type: "TURN_ON", crownstoneId: event.crownstone.uid });
                    }
                    else {
                        switchPairs.push({ type: "DIMMING", crownstoneId: event.crownstone.uid, switchState: switchState });
                    }
                    CrownstoneHub_1.CrownstoneHub.uart.switchCrownstones(switchPairs);
                }
                break;
        }
    }
    handleDataChangeEvent(event) {
        switch (event.subType) {
            case 'stones':
                // sync
                EventBus_1.eventBus.emit(topics_1.topics.CLOUD_SYNC_REQUIRED);
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
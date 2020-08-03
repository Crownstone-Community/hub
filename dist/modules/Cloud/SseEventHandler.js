"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseEventHandler = void 0;
const EventBus_1 = require("../EventBus");
class SseEventHandler {
    constructor() {
        this.handleSseEvent = (event) => {
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
                    EventBus_1.eventBus.emit("CLOUD_SYNC_REQUIRED");
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
                EventBus_1.eventBus.emit("TOKEN_EXPIRED");
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
                EventBus_1.eventBus.emit("SWITCH_CROWNSTONE", event.crownstone);
                break;
        }
    }
    handleDataChangeEvent(event) {
        switch (event.subType) {
            case 'stones':
                // sync
                EventBus_1.eventBus.emit("CLOUD_SYNC_REQUIRED");
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
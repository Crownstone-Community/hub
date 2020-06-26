import {eventBus} from '../EventBus';
import {topics} from '../topics';
import {CrownstoneHub} from '../CrownstoneHub';

export class SseEventHandler {

  constructor() {}

  handleSseEvent = (event: SseEvent) => {
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
        eventBus.emit(topics.CLOUD_SYNC_REQUIRED);
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
  }

  handleSystemEvent(event: SystemEvent) {
    switch (event.subType) {
      case 'TOKEN_EXPIRED':
        // login again
        eventBus.emit(topics.TOKEN_EXPIRED);
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

  handleCommandEvent(event: SwitchCrownstoneEvent) {
    switch (event.subType) {
      case 'switchCrownstone':
        // switch the crownstone!
        if (event.crownstone.switchState !== null) {
          let switchPairs: SwitchPair[] = [{crownstoneId: event.crownstone.uid, switchState: event.crownstone.switchState}];
          CrownstoneHub.uart.switchCrownstones(switchPairs)
        }
        break;
    }
  }

  handleDataChangeEvent(event: DataChangeEvent) {
    switch (event.subType) {
      case 'stones':
        // sync
        eventBus.emit(topics.CLOUD_SYNC_REQUIRED);
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
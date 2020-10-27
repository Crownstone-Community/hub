import {eventBus} from '../HubEventBus';
import {topics} from '../topics';
import {CrownstoneHub} from '../CrownstoneHub';

import {Logger} from '../../Logger';
const log = Logger(__filename);


export class SseEventHandler {

  constructor() {}

  handleSseEvent = (event: SseEvent) => {
    log.debug("Event received: ", event)
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

  handleCommandEvent(event: MultiSwitchCrownstoneEvent) {
    switch (event.subType) {
      case 'multiSwitch':
        if (!Array.isArray(event.switchData)) { return; }
        let switchPairs: SwitchData[] = [];
        event.switchData.forEach((switchData) => {
          if (switchData.type === 'PERCENTAGE' && switchData.percentage !== undefined) {
            switchPairs.push({type: switchData.type, percentage: switchData.percentage, stoneId: switchData.uid})
          }
          else if (switchData.type === 'PERCENTAGE') {
            // if we have no percentage, we just turn it on. this is mostly to silence typescript.
            switchPairs.push({type: "TURN_ON", stoneId: switchData.uid})
          }
          else {
            switchPairs.push({type: switchData.type, stoneId: switchData.uid})
          }
        });
        if (switchPairs.length > 0) {
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
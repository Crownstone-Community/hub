import {HubDataParser} from '../../protocol/rx/HubData';
import {HubDataType, HubReplyError, HubRequestDataType} from '../../protocol/HubProtocol';
import {Dbs} from '../Data/DbReference';
import {CrownstoneCloud} from 'crownstone-cloud';
import {HubDataReplyError, HubDataReplyString, HubDataReplySuccess} from '../../protocol/tx/HubDataReply';
import {eventBus} from '../HubEventBus';
import {topics} from '../topics';
import {CrownstoneUart} from 'crownstone-uart';
import {Logger} from '../../Logger';

const log = Logger(__filename);

export class UartHubDataCommunication {
  uart : CrownstoneUart;

  constructor(uart: CrownstoneUart) {
    this.uart = uart;
  }

  handleIncomingHubData(data: Buffer) {
    let parsed = new HubDataParser(data);
    if (parsed.valid) {
      if      (parsed.result.type === HubDataType.SETUP) {
        this.handleSetup(parsed.result)
      }
      else if (parsed.result.type === HubDataType.REQUEST_DATA) {
        this.handleDataRequest(parsed.result)
      }
    }
  }

  async handleSetup(setupPacket: HubData_setup) {
    if (await Dbs.hub.isSet() === false) {
      let cloud = new CrownstoneCloud();
      try {
        await cloud.hubLogin(setupPacket.cloudId, setupPacket.token);
      }
      catch (e) {
        // could not log in.
        log.warn("Could not setup, Login failed.",e);
        return this.uart.uart.hubDataReply(HubDataReplyError(HubReplyError.INVALID_TOKEN));
      }
      try {
        let hubCloudData = await cloud.hub().data();
        await Dbs.hub.create({
          name: hubCloudData.name,
          token: setupPacket.token,
          cloudId: setupPacket.cloudId,
          sphereId: hubCloudData.sphereId,
        });
        eventBus.emit(topics.HUB_CREATED);
        return this.uart.uart.hubDataReply(HubDataReplySuccess());
      }
      catch (e) {
        // could not log in.
        log.warn("Could not setup, something went wrong.",e);
        return this.uart.uart.hubDataReply(HubDataReplyError(HubReplyError.UNKNOWN));
      }
    }
    else {
      log.info("Could not setup, this hub is already owned.");
      this.uart.uart.hubDataReply(HubDataReplyError(HubReplyError.NOT_IN_SETUP_MODE));
    }
  }



  async handleDataRequest(requestPacket: HubData_requestData) {
    if (requestPacket.requestedType === HubRequestDataType.CLOUD_ID) {
      if (await Dbs.hub.isSet() === false) {
        return this.uart.uart.hubDataReply(HubDataReplyError(HubReplyError.IN_SETUP_MODE))
      }
      else {
        let hub = await Dbs.hub.get();
        if (hub?.cloudId) {
          return this.uart.uart.hubDataReply(HubDataReplyString(requestPacket.requestedType, String(hub?.cloudId)));
        }
        // no hub or no cloudId.
        return this.uart.uart.hubDataReply(HubDataReplyError(HubReplyError.IN_SETUP_MODE));
      }
    }
  }
}
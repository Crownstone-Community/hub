import {HubDataParser} from '../../protocol/rx/HubData';
import {HubDataType, HubReplyError, HubRequestDataType} from '../../protocol/HubProtocol';
import {Dbs} from '../Data/DbReference';
import {CrownstoneCloud} from 'crownstone-cloud';
import {HubDataReplyError, HubDataReplyString, HubDataReplySuccess} from '../../protocol/tx/HubDataReply';
import {eventBus} from '../HubEventBus';
import {topics} from '../topics';
import {CrownstoneUart} from 'crownstone-uart';
import {Logger} from '../../Logger';
import {CrownstoneUtil} from '../CrownstoneUtil';
import {ResultValue} from 'crownstone-core';

const log = Logger(__filename);


/**
 * This module handles incoming HubData via uart. It parses and handles the commands. It will also send replies over uart.
 */
export class UartHubDataCommunication {
  uart : CrownstoneUart;

  constructor(uart: CrownstoneUart) {
    this.uart = uart;
  }

  handleIncomingHubData(data: Buffer) {
    let parsed = new HubDataParser(data);
    if (parsed.valid) {
      if (parsed.result.type === HubDataType.SETUP) {
        this.handleSetup(parsed.result)
      }
      else if (parsed.result.type === HubDataType.REQUEST_DATA) {
        this.handleDataRequest(parsed.result)
      }
      else if (parsed.result.type === HubDataType.FACTORY_RESET) {
        this.handleFactoryResetRequest(parsed.result)
      }
      else if (parsed.result.type === HubDataType.FACTORY_RESET_HUB_ONLY) {
        this.handleFactoryResetHubOnlyRequest(parsed.result)
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
        return this.uart.hub.dataReply(HubDataReplyError(HubReplyError.INVALID_TOKEN), ResultValue.SUCCESS);
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
        return this.uart.hub.dataReply(HubDataReplySuccess(), ResultValue.SUCCESS);
      }
      catch (e) {
        // could not log in.
        log.warn("Could not setup, something went wrong.",e);
        return this.uart.hub.dataReply(HubDataReplyError(HubReplyError.UNKNOWN), ResultValue.SUCCESS);
      }
    }
    else {
      log.warn("Could not setup, this hub is already owned.");
      this.uart.hub.dataReply(HubDataReplyError(HubReplyError.NOT_IN_SETUP_MODE), ResultValue.SUCCESS);
    }
  }



  async handleDataRequest(requestPacket: HubData_requestData) {
    if (requestPacket.requestedType === HubRequestDataType.CLOUD_ID) {
      if (await Dbs.hub.isSet() === false) {
        return this.uart.hub.dataReply(HubDataReplyError(HubReplyError.IN_SETUP_MODE), ResultValue.SUCCESS)
      }
      else {
        if (await Dbs.hub.isSet()) {
          let hub = await Dbs.hub.get();
          return this.uart.hub.dataReply(HubDataReplyString(requestPacket.requestedType, String(hub?.cloudId)), ResultValue.SUCCESS);
        }
        // no hub or no cloudId.
        return this.uart.hub.dataReply(HubDataReplyError(HubReplyError.IN_SETUP_MODE), ResultValue.SUCCESS);
      }
    }
  }

  async handleFactoryResetRequest(requestPacket: HubData_factoryReset) {
    try {
      log.notice("Factory reset started, notifying dongle...");
      await this.uart.hub.dataReply(HubDataReplySuccess(), ResultValue.SUCCESS);
      log.notice("State notified!");

      log.notice("Initiating factory reset procedure...");
      await CrownstoneUtil.deleteCrownstoneHub(true);
      log.notice("Initiated factory reset procedure. Done.");
    }
    catch(e) {
      log.warn("Could not factory reset this hub.", e);
      this.uart.hub.dataReply(HubDataReplyError(HubReplyError.NOT_IN_SETUP_MODE), ResultValue.SUCCESS);
    }
  }

  async handleFactoryResetHubOnlyRequest(requestPacket: HubData_factoryResetHubOnly) {
    try {
      log.notice("Factory reset hub only started, notifying dongle...");
      await this.uart.hub.dataReply(HubDataReplySuccess(), ResultValue.SUCCESS);
      log.notice("State notified!");

      log.notice("Initiating factory reset hub only procedure...");
      await CrownstoneUtil.deleteCrownstoneHub(true);
      log.notice("Initiated factory reset procedure. Done.");
    }
    catch(e) {
      log.warn("Could not factory reset this hub.", e);
      this.uart.hub.dataReply(HubDataReplyError(HubReplyError.NOT_IN_SETUP_MODE), ResultValue.SUCCESS);
    }
  }
}
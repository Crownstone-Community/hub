import {DataStepper} from "crownstone-core";
import {HubDataType} from '../hubProtocol';
import {parseFactoryResetData, parseFactoryResetHubOnlyData, parseHubSetup, parseRequestData} from './HubDataParsers';


export class HubDataParser {

  protocol: number;
  dataType: number;
  valid:    boolean = true;
  result:   HubData;
  raw:      Buffer

  constructor(data: Buffer) {
    this.raw = data;
    this.parse();
  }

  parse() {
    let stepper = new DataStepper(this.raw);
    this.protocol = stepper.getUInt8();
    this.dataType = stepper.getUInt16();
    switch (this.dataType) {
      case HubDataType.SETUP:
        return parseHubSetup(this, stepper);
      case HubDataType.REQUEST_DATA:
        return parseRequestData(this,stepper);
      case HubDataType.FACTORY_RESET:
        return parseFactoryResetData(this,stepper);
      case HubDataType.FACTORY_RESET_HUB_ONLY:
        return parseFactoryResetHubOnlyData(this,stepper);
    }
  }

}
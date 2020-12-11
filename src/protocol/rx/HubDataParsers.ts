import {HubDataParser} from "./HubData";
import {DataStepper} from "crownstone-core";


export function parseHubSetup(dataRef: HubDataParser, stepper: DataStepper) {
  try {
    let tokenLength = stepper.getUInt16();
    let tokenBuffer = stepper.getBuffer(tokenLength);
    let token = tokenBuffer.toString();

    let cloudIdLength = stepper.getUInt16();
    let cloudIdBuffer = stepper.getBuffer(cloudIdLength);
    let cloudId = cloudIdBuffer.toString();

    dataRef.result = {type: dataRef.dataType as any, token, cloudId};
  }
  catch (e) {
    dataRef.valid = false;
  }
}

export function parseRequestData(dataRef: HubDataParser, stepper: DataStepper) {
  try {
    let requestedType = stepper.getUInt16();

    dataRef.result = {type: dataRef.dataType as any, requestedType: requestedType};
  }
  catch (e) {
    dataRef.valid = false;
  }
}


export function parseFactoryResetData(dataRef: HubDataParser, stepper: DataStepper) {
  try {
    let deadbeef = stepper.getUInt32();
    if (deadbeef != 0xdeadbeef) {
      dataRef.valid = false;
    }
    dataRef.result = { type: dataRef.dataType as any };
  }
  catch (e) {
    dataRef.valid = false;
  }
}

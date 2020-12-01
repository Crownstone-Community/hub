import {DataWriter, ResultValue} from 'crownstone-core';
import {HubReplyCode} from '../HubProtocol';

const PROTOCOL_VERSION = 0;
const PREFIX_SIZE = 5;

export function HubDataReplyError(type: number, message: string = '') {
  let headerBuffer = new DataWriter(PREFIX_SIZE + 2); // 5 * prefix + 2
  headerBuffer.putUInt16(ResultValue.SUCCESS);
  headerBuffer.putUInt8(PROTOCOL_VERSION);
  headerBuffer.putUInt16(HubReplyCode.ERROR);

  let stringBuffer = Buffer.from(message, 'ascii');

  let result = Buffer.concat([headerBuffer.getBuffer(), stringBuffer]);

  if (result.length > 100) {
    throw "GENERATED_HUB_REPLY_TOO_LONG";
  }
  return result;
}


export function HubDataReplySuccess(data?:any) : Buffer {
  let headerBuffer = new DataWriter(PREFIX_SIZE + 2); // 2 (connection protocol) + 3 (prefix) + 4 (data)
  headerBuffer.putUInt16(ResultValue.SUCCESS); // This is the required value of the connection protocol
  headerBuffer.putUInt8(PROTOCOL_VERSION);
  headerBuffer.putUInt16(HubReplyCode.SUCCESS); // SUCCESS CODE

  let result = headerBuffer.getBuffer();

  if (result.length > 100) {
    throw "GENERATED_HUB_REPLY_TOO_LONG";
  }
  return result;
}


export function HubDataReplyString(requestedDataType: number, data: string) : Buffer {
  let stringBuffer = Buffer.from(data, 'ascii');
  return HubDataReplyData(requestedDataType, stringBuffer);
}

export function HubDataReplyData(requestedDataType: number, data: Buffer) : Buffer {
  let headerBuffer = new DataWriter(PREFIX_SIZE + 2); // 5 + 2 + N bytes
  headerBuffer.putUInt16(ResultValue.SUCCESS);
  headerBuffer.putUInt8(PROTOCOL_VERSION);
  headerBuffer.putUInt16(HubReplyCode.DATA_REPLY);

  headerBuffer.putUInt16(requestedDataType);

  let result = Buffer.concat([headerBuffer.getBuffer(), data])

  if (result.length > 100) {
    throw "GENERATED_HUB_REPLY_TOO_LONG";
  }
  return result;
}
import {DataWriter, ResultValue} from 'crownstone-core';
import {HubReplyCode} from '../HubProtocol';

const PROTOCOL_VERSION = 0;
const PREFIX_SIZE = 3;

export function HubDataReplyError(type: number, message: string = '') {
  let headerBuffer = new DataWriter(PREFIX_SIZE + 2); // prefix + 2
  headerBuffer.putUInt8(PROTOCOL_VERSION);
  headerBuffer.putUInt16(HubReplyCode.ERROR);
  headerBuffer.putUInt16(type);

  let stringBuffer = Buffer.from(message, 'ascii');

  let result = Buffer.concat([headerBuffer.getBuffer(), stringBuffer]);

  if (result.length > 100) {
    throw "GENERATED_HUB_REPLY_TOO_LONG";
  }
  return result;
}


export function HubDataReplySuccess() : Buffer {
  let headerBuffer = new DataWriter(PREFIX_SIZE + 2); // 1 (connection protocol) + 2 (ReplyType)
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
  let headerBuffer = new DataWriter(PREFIX_SIZE + 2); // 3 + 2 + N bytes
  headerBuffer.putUInt8(PROTOCOL_VERSION);
  headerBuffer.putUInt16(HubReplyCode.DATA_REPLY);

  headerBuffer.putUInt16(requestedDataType);

  let result = Buffer.concat([headerBuffer.getBuffer(), data])

  if (result.length > 100) {
    throw "GENERATED_HUB_REPLY_TOO_LONG";
  }
  return result;
}
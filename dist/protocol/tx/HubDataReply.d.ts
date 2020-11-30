/// <reference types="node" />
export declare function HubDataReplyError(type: number, message?: string): Buffer;
export declare function HubDataReplySuccess(data?: any): Buffer;
export declare function HubDataReplyString(requestedDataType: number, data: string): Buffer;
export declare function HubDataReplyData(requestedDataType: number, data: Buffer): Buffer;

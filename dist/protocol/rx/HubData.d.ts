/// <reference types="node" />
export declare class HubDataParser {
    protocol: number;
    dataType: number;
    valid: boolean;
    result: HubData;
    raw: Buffer;
    constructor(data: Buffer);
    parse(): void;
}

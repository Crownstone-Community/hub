/// <reference types="node" />
import { CrownstoneUart } from 'crownstone-uart';
/**
 * This module handles incoming HubData via uart. It parses and handles the commands. It will also send replies over uart.
 */
export declare class UartHubDataCommunication {
    uart: CrownstoneUart;
    constructor(uart: CrownstoneUart);
    handleIncomingHubData(data: Buffer): void;
    handleSetup(setupPacket: HubData_setup): Promise<void>;
    handleDataRequest(requestPacket: HubData_requestData): Promise<void>;
    handleFactoryResetRequest(requestPacket: HubData_factoryReset): Promise<void>;
    handleFactoryResetHubOnlyRequest(requestPacket: HubData_factoryResetHubOnly): Promise<void>;
}

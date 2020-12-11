/// <reference types="node" />
import { CrownstoneUart } from 'crownstone-uart';
export declare class UartHubDataCommunication {
    uart: CrownstoneUart;
    constructor(uart: CrownstoneUart);
    handleIncomingHubData(data: Buffer): void;
    handleSetup(setupPacket: HubData_setup): Promise<void>;
    handleDataRequest(requestPacket: HubData_requestData): Promise<void>;
    handleFactoryResetRequest(requestPacket: HubData_factoryReset): Promise<void>;
}

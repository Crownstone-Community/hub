declare class HubStatusManagerClass {
    encryptionRequired: boolean;
    clientHasBeenSetup: boolean;
    clientHasInternet: boolean;
    clientHasError: boolean;
    setStatus(hubStatus: HubStatusData): Promise<void>;
    setActualStatus(): Promise<void>;
}
export declare const HubStatusManager: HubStatusManagerClass;
export {};

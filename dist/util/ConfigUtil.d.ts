interface HubConfig {
    useDevControllers: boolean;
    useLogControllers: boolean;
    logging: HubLogConfig;
}
interface HubLogConfig {
    consoleLevel: TransportLevel;
    fileLevel: TransportLevel;
    fileLoggingEnabled: boolean;
}
export declare function getHubConfig(): HubConfig;
export declare function storeHubConfig(config: HubConfig): void;
export {};

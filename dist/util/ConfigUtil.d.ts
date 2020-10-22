interface HubConfig {
    useDevControllers: boolean;
    useLogControllers: boolean;
    logging: HubLogConfig;
}
interface HubLogConfig {
    [loggerId: string]: {
        console: TransportLevel;
        file: TransportLevel;
    };
}
export declare function getHubConfig(): HubConfig;
export declare function storeHubConfig(config: HubConfig): void;
export {};

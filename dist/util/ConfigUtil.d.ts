interface HubConfig {
    useDevControllers: boolean;
    useLogControllers: boolean;
    logging: HubLogConfig;
}
interface HubPortConfig {
    httpPort?: number;
    enableHttp?: boolean;
    httpsPort?: number;
}
interface HubLogConfig {
    [loggerId: string]: {
        console: TransportLevel;
        file: TransportLevel;
    };
}
export declare function getHubConfig(): HubConfig;
export declare function getPortConfig(): HubPortConfig;
export declare function getHttpsPort(): number;
export declare function getHttpPort(): number;
export declare function storeHubConfig(config: HubConfig): void;
export {};

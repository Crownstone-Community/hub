interface HubConfig {
    useDevControllers: boolean;
    useLogControllers: boolean;
}
export declare function getHubConfig(): HubConfig;
export declare function storeHubConfig(config: HubConfig): void;
export {};

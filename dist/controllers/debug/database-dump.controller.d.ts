export declare class DatabaseDumpController {
    constructor();
    dumpHubDatabase(): Promise<any>;
    dumpUserDatabase(): Promise<any>;
    dumpUserPermissionsDatabase(): Promise<any>;
    dumpSphereFeatureDatabase(): Promise<any>;
}

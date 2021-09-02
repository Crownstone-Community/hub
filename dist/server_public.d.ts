import express from 'express';
import { ApplicationConfig } from '@loopback/core';
import { CrownstoneHubApplication } from './application';
export { ApplicationConfig };
export declare class PublicExpressServer {
    readonly app: express.Application;
    private server?;
    httpPort: number;
    httpsPort: number;
    constructor(options: ApplicationConfig | undefined, lbApp: CrownstoneHubApplication);
    start(): Promise<void>;
    stop(): Promise<void>;
}

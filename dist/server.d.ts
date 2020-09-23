import express from 'express';
import { CrownstoneHubApplication } from './application';
import { ApplicationConfig } from '@loopback/core';
export { ApplicationConfig };
export declare class ExpressServer {
    readonly app: express.Application;
    readonly lbApp: CrownstoneHubApplication;
    private server?;
    constructor(options?: ApplicationConfig);
    boot(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
}

import express from 'express';
import { ApplicationConfig } from '@loopback/core';
export { ApplicationConfig };
export declare class PublicExpressServer {
    readonly app: express.Application;
    private server?;
    httpPort: number;
    httpsPort: number;
    constructor(options?: ApplicationConfig);
    start(): Promise<void>;
    stop(): Promise<void>;
}

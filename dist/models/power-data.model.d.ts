import { Entity } from '@loopback/repository';
export declare class PowerData extends Entity {
    constructor(data?: Partial<PowerData>);
    id: string;
    stoneUID: number;
    powerUsage: number;
    powerFactor: number;
    timestamp: Date;
    significant: boolean;
    uploaded: boolean;
}

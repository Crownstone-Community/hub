import { Entity } from '@loopback/repository';
export declare class EnergyDataProcessed extends Entity {
    id: string;
    stoneUID: number;
    energyUsage: number;
    timestamp: Date;
    uploaded: boolean;
    interval: string;
}

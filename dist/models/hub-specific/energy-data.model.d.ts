import { Entity } from '@loopback/repository';
export declare class EnergyData extends Entity {
    id: string;
    stoneUID: number;
    energyUsage: number;
    correctedEnergyUsage: number;
    pointPowerUsage: number;
    timestamp: Date;
    processed: boolean;
}

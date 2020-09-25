import { EnergyDataProcessedRepository } from '../repositories';
/**
 * This controller will echo the state of the hub.
 */
export declare class EnergyController {
    protected energyDataProcessedRepo: EnergyDataProcessedRepository;
    constructor(energyDataProcessedRepo: EnergyDataProcessedRepository);
    getEnergyData(crownstoneUID: number, from: Date, until: Date, limit: number): Promise<import("../models").EnergyDataProcessed[]>;
    getEnergyAvailability(): Promise<{
        crownstoneUID: number;
        count: number;
    }[]>;
}

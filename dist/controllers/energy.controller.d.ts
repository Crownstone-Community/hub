import { Count } from '@loopback/repository';
import { EnergyDataProcessedRepository, EnergyDataRepository } from '../repositories';
import { UserProfileDescription } from '../security/authentication-strategies/csToken-strategy';
/**
 * This controller will echo the state of the hub.
 */
export declare class EnergyController {
    protected energyDataProcessedRepo: EnergyDataProcessedRepository;
    protected energyDataRepo: EnergyDataRepository;
    constructor(energyDataProcessedRepo: EnergyDataProcessedRepository, energyDataRepo: EnergyDataRepository);
    getEnergyData(userProfile: UserProfileDescription, crownstoneUID: number, from: Date, until: Date, limit: number): Promise<import("../models").EnergyDataProcessed[]>;
    getEnergyAvailability(userProfile: UserProfileDescription): Promise<{
        crownstoneUID: number;
        count: number;
    }[]>;
    deleteStoneEnergy(userProfile: UserProfileDescription, crownstoneUID: number): Promise<Count>;
    deleteAllEnergyData(userProfile: UserProfileDescription): Promise<Count>;
}

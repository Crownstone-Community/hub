/// <reference types="node" />
import Timeout = NodeJS.Timeout;
import { EnergyData, EnergyDataProcessed } from '../../models';
export declare class EnergyMonitor {
    timeInterval: Timeout | null;
    energyIsProcessing: boolean;
    init(): void;
    stop(): void;
    processing(): Promise<void>;
    processMeasurements(): Promise<void>;
    uploadProcessed(): Promise<void>;
    _uploadStoneEnergy(processedData: EnergyDataProcessed[]): Promise<void>;
    _processStoneEnergy(stoneUID: number, energyData: EnergyData[]): Promise<void>;
    collect(crownstoneId: number, accumulatedEnergy: number, powerUsage: number, timestamp: number): Promise<EnergyData>;
}

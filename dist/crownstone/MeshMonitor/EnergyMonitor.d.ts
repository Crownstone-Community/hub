/// <reference types="node" />
import Timeout = NodeJS.Timeout;
import { EnergyData, EnergyDataProcessed } from '../../models';
import { InMemoryCache } from '../Data/InMemoryCache';
export declare class EnergyMonitor {
    timeInterval: Timeout | null;
    storeInterval: Timeout | null;
    energyIsProcessing: boolean;
    energyIsAggregating: boolean;
    processingPaused: boolean;
    pauseTimeout: Timeout;
    aggregationProcessingPaused: boolean;
    aggregationPauseTimeout: Timeout;
    energyCache: InMemoryCache;
    constructor();
    init(): void;
    stop(): void;
    pauseProcessing(seconds: number): void;
    pauseAggregationProcessing(seconds: number): void;
    resumeProcessing(): void;
    resumeAggregationProcessing(): void;
    processing(): Promise<void>;
    processMeasurements(force?: boolean): Promise<void>;
    processAggregations(force?: boolean): Promise<void>;
    _processAggregations(stoneUID: number, intervalData: IntervalData): Promise<void>;
    uploadProcessed(): Promise<void>;
    _uploadStoneEnergy(processedData: EnergyDataProcessed[]): Promise<void>;
    _processStoneEnergy(stoneUID: number, energyData: EnergyData[]): Promise<void>;
    collect(crownstoneId: number, accumulatedEnergy: number, powerUsage: number, timestamp: number): void;
}

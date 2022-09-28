/// <reference types="node" />
import Timeout = NodeJS.Timeout;
import { EnergyData } from '../../models';
import { InMemoryCache } from '../data/InMemoryCache';
interface CollectedEnergyData {
    stoneUID: number;
    energyUsage: number;
    pointPowerUsage: number;
    timestamp: Date;
    processed: boolean;
}
interface CollectedEnergyDataForUpload {
    stoneUID: number;
    energyUsage: number;
    timestamp: Date;
}
export declare class EnergyMonitor {
    timeInterval: Timeout | null;
    storeInterval: Timeout | null;
    uploadInterval: Timeout | null;
    pauseTimeout: Timeout;
    aggregationPauseTimeout: Timeout;
    energyIsProcessing: boolean;
    energyIsAggregating: boolean;
    processingPaused: boolean;
    aggregationProcessingPaused: boolean;
    uploadEnergyCache: InMemoryCache<CollectedEnergyDataForUpload>;
    energyCache: InMemoryCache<CollectedEnergyData>;
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
    _processStoneEnergy(stoneUID: number, energyData: EnergyData[]): Promise<void>;
    collect(crownstoneId: number, accumulatedEnergy: number, powerUsage: number, timestamp: number): void;
    _uploadStoneEnergy(measuredData: CollectedEnergyDataForUpload[]): Promise<void>;
}
export {};

import { EnergyData, EnergyDataProcessed } from '../../models';
import { DataObject } from '@loopback/repository/src/common-types';
declare type samplePointGetter = (timestamp: number) => number;
interface IntervalDescription {
    intervalMs: number;
    calculateSamplePoint: samplePointGetter;
}
export declare function minuteInterval(timestamp: number): number;
export declare function processPair(previousPoint: EnergyData, nextPoint: EnergyData, intervalData: IntervalDescription, samples: DataObject<EnergyDataProcessed>[]): Promise<void>;
export {};

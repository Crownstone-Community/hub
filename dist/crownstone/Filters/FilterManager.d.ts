import { Uart } from '../uart/Uart';
export declare class FilterManagerClass {
    initialized: boolean;
    uartReference: Uart | null;
    constructor();
    injectUartReference(uartReference: Uart): void;
    verifyMasterCrc(): void;
    refreshFilterSets(baseMasterVersion?: number, allowSyncing?: boolean): Promise<void>;
    reconstructFilters(): Promise<boolean>;
}
export declare const FilterManager: FilterManagerClass;

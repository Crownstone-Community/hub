import { Uart } from '../uart/Uart';
export declare class FilterManager {
    initialized: boolean;
    uartReference: Uart;
    constructor(uartReference: Uart);
    init(): void;
    cleanup(): void;
    refreshFilterSets(baseMasterVersion?: number): Promise<void>;
}

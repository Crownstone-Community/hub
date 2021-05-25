import { PowerMonitor } from './PowerMonitor';
import { EnergyMonitor } from './EnergyMonitor';
import { NetworkMonitor } from './NetworkMonitor';
import { SwitchMonitor } from './SwitchMonitor';
declare type callback = () => void;
export declare class MeshMonitor {
    eventsRegistered: boolean;
    unsubscribeEventListeners: callback[];
    power: PowerMonitor;
    energy: EnergyMonitor;
    switch: SwitchMonitor;
    network: NetworkMonitor;
    constructor();
    init(): void;
    cleanup(): void;
    setupEvents(): void;
    gather(data: ServiceDataJson): void;
}
export {};

export declare class SwitchMonitor {
    lastSwitchStates: {
        [key: number]: number;
    };
    collect(crownstoneId: number, switchState: number): void;
}

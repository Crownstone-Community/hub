export declare class SseEventHandler {
    constructor();
    handleSseEvent: (event: SseEvent) => void;
    handleSystemEvent(event: SystemEvent): void;
    handleCommandEvent(event: SwitchCrownstoneEvent | MultiSwitchCrownstoneEvent): void;
    handleDataChangeEvent(event: DataChangeEvent): void;
}

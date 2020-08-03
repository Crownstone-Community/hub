export declare class EventBusClass {
    _topics: {
        [key: string]: {
            id: string;
            callback: (data?: any) => void;
        }[];
    };
    _topicIds: {
        [key: string]: boolean;
    };
    constructor();
    on(topic: string, callback: (data: any) => void): () => void;
    emit(topic: string, data?: any): void;
    clearAllEvents(): void;
}
export declare let eventBus: any;

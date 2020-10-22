interface PromiseContainer {
    promise: () => Promise<any>;
    resolve: (result: any) => any;
    reject: (err: any) => void;
    message: string;
    completed: boolean;
    timeout: number;
}
export declare class PromiseManager {
    pendingPromises: any;
    promiseInProgress: any;
    clearPendingPromiseTimeout: any;
    constructor();
    register(promise: () => Promise<any>, message?: string, customTimeoutMs?: number): Promise<any>;
    registerPriority(promise: () => Promise<any>, message?: string, customTimeoutMs?: number): Promise<any>;
    _register(promise: () => Promise<any>, message?: string, priorityCommand?: boolean, timeout?: number): Promise<any>;
    executePromise(promiseContainer: PromiseContainer): void;
    /**
     * This method makes sure the promise is only resolved or rejected once! This also makes sure the moveOn() method
     * is not invoked multiple times.
     * @param promiseContainer
     * @param callback
     */
    finalize(promiseContainer: PromiseContainer, callback: () => void): void;
    moveOn(): void;
    getNextPromise(): void;
}
export {};

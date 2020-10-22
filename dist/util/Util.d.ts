export declare const Util: {
    wait: (waitTimeMs: number) => Promise<void>;
    pad: (str: string | number) => string | number;
    getWeekNumber: (timestamp: number) => number;
    getDateHourId: (timestamp: number) => string;
    getDateFormat: (timestamp: number) => string;
    getDateTimeFormat: (timestamp: number) => string;
    getTimeFormat: (timestamp: number, showSeconds?: boolean) => string;
    getToken: () => string;
    mixin: (base: any, section: any, context: any) => void;
    getUUID: () => string;
    getShortUUID: () => string;
    versions: {
        isHigher: (version: string, compareWithVersion: string) => boolean;
        /**
         * This is the same as the isHigherOrEqual except it allows access to githashes. It is up to the dev to determine what it can and cannot do.
         * @param myVersion
         * @param minimumRequiredVersion
         * @returns {any}
         */
        canIUse: (myVersion: string, minimumRequiredVersion: string) => boolean;
        isHigherOrEqual: (version: string, compareWithVersion: string) => boolean;
        isLower: (version: string, compareWithVersion: string) => boolean;
    };
    deepCopy(object: any): any;
    deepExtend: (a: any, b: any, protoExtend?: boolean, allowDeletion?: boolean) => any;
    deepCompare: (a: any, b: any, d?: number) => boolean;
    promiseBatchPerformer: (arr: any[], method: PromiseCallback) => Promise<unknown>;
    _promiseBatchPerformer: (arr: any[], index: number, method: PromiseCallback) => Promise<unknown>;
    capitalize: (inputStr: string) => string;
    getLocalIps: () => string[];
    stripTrailingSlash: (path: string) => string;
};

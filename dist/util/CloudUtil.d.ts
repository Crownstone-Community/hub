export declare const CloudUtil: {
    createKey: () => string;
    createIBeaconUUID(): string;
    createShortUID(): number;
    createIBeaconMinor(): number;
    createIBeaconMajor(): number;
    createToken: () => string;
    createId: (source?: any) => string;
    getDate(): Date;
    hashPassword(plaintextPassword: string): string;
};

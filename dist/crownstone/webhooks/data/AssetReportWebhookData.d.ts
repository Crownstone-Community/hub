export declare class AssetReportWebhookData {
    crownstoneId: number;
    crownstoneMacAddress: string | null;
    assetMacAddress: string;
    assetRssi: number;
    rssiChannel: number;
    timestamp: number;
    constructor(data: AssetMacReportData);
    getData(): {
        crownstoneId: number;
        crownstoneMacAddress: string | null;
        assetMacAddress: string;
        assetRssi: number;
        rssiChannel: number;
        timestamp: number;
    };
    getCompressedData(): {
        cid: number;
        cm: string | null;
        am: string;
        r: number;
        c: number;
        t: number;
    };
}
export declare function getMacAddressFromCrownstoneId(crownstoneId: number): string | null;

import { UserProfileDescription } from '../../security/authentication-strategies/csToken-strategy';
export declare class LogController {
    constructor();
    setLogLevel(userProfile: UserProfileDescription, level: string): Promise<void>;
    setFileLogging(userProfile: UserProfileDescription, enabled: boolean): Promise<void>;
    availableLogFiles(userProfile: UserProfileDescription): Promise<string[]>;
    downloadLogFile(userProfile: UserProfileDescription, filename: string): Promise<string[]>;
    deleteAllLogs(userProfile: UserProfileDescription): Promise<void>;
}

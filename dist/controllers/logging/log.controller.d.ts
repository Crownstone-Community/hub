/// <reference types="express" />
import { Response } from '@loopback/rest';
import { UserProfileDescription } from '../../security/authentication-strategies/csToken-strategy';
interface LogFileDetails {
    filename: string;
    sizeMB: number;
}
export declare class LogController {
    constructor();
    setLogLevel(userProfile: UserProfileDescription, consoleLevel: string, fileLevel: string): Promise<void>;
    setFileLogging(userProfile: UserProfileDescription, enabled: boolean): Promise<void>;
    availableLogFiles(userProfile: UserProfileDescription): Promise<LogFileDetails[]>;
    downloadLogFile(userProfile: UserProfileDescription, filename: string, response: Response): Promise<Response<any>>;
    deleteAllLogs(userProfile: UserProfileDescription): Promise<void>;
}
export {};

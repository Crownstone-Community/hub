/// <reference types="express" />
import { Response } from '@loopback/rest';
import { UserProfileDescription } from '../../security/authentication-strategies/csToken-strategy';
interface LogFileDetails {
    filename: string;
    sizeMB: number;
}
export declare class LogController {
    constructor();
    getLoggers(userProfile: UserProfileDescription): Promise<any>;
    setIndividualLevels(userProfile: UserProfileDescription, loggerConfig: any): Promise<any>;
    clearIndividualLevels(userProfile: UserProfileDescription): Promise<any>;
    availableLogFiles(userProfile: UserProfileDescription): Promise<LogFileDetails[]>;
    downloadLogFile(userProfile: UserProfileDescription, filename: string, response: Response): Promise<Response<any>>;
    deleteAllLogs(userProfile: UserProfileDescription): Promise<void>;
}
export {};

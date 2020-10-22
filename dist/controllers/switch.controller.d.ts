import { UserProfileDescription } from '../security/authentication-strategies/csToken-strategy';
export declare class SwitchController {
    constructor();
    turnOn(userProfile: UserProfileDescription, crownstoneUID: number): Promise<void>;
    turnOff(userProfile: UserProfileDescription, crownstoneUID: number): Promise<void>;
    dim(userProfile: UserProfileDescription, crownstoneUID: number, percentage: number): Promise<void>;
    switchCrownstones(userProfile: UserProfileDescription, switchData: SwitchData[]): Promise<void>;
}

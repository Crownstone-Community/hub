import { HubRepository } from '../repositories/hub.repository';
import { UserRepository } from '../repositories';
/**
 * This controller will echo the state of the hub.
 */
export declare class HubController {
    protected hubRepo: HubRepository;
    protected userRepo: UserRepository;
    constructor(hubRepo: HubRepository, userRepo: UserRepository);
    delete(YesImSure: string): Promise<string>;
    getHubSatus(): Promise<HubStatus>;
}

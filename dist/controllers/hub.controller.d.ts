import { DataObject } from '@loopback/repository';
import { HubRepository } from '../repositories/hub.repository';
import { UserRepository } from '../repositories';
import { Hub } from '../models';
/**
 * This controller will echo the state of the hub.
 */
export declare class HubController {
    protected hubRepo: HubRepository;
    protected userRepo: UserRepository;
    constructor(hubRepo: HubRepository, userRepo: UserRepository);
    createHub(newHub: DataObject<Hub>): Promise<void>;
    delete(YesImSure: string): Promise<string>;
    deleteEverything(YesImSure: string): Promise<string>;
    getHubStatus(): Promise<HubStatus>;
}

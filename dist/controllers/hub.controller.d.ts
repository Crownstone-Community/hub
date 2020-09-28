import { HubRepository } from '../repositories/hub.repository';
import { Hub } from '../models/hub.model';
import { DataObject } from '@loopback/repository/src/common-types';
import { UserRepository } from '../repositories';
/**
 * This controller will echo the state of the hub.
 */
export declare class HubController {
    protected hubRepo: HubRepository;
    protected userRepo: UserRepository;
    constructor(hubRepo: HubRepository, userRepo: UserRepository);
    createHub(newHub: DataObject<Hub>): Promise<void>;
    updateHub(editedHub: DataObject<Hub>): Promise<void>;
    delete(YesImSure: string): Promise<string>;
    getHubSatus(): Promise<HubStatus>;
}

import { UserRepository } from '../repositories/';
import { User } from '../models';
export declare class UserService {
    userRepository: UserRepository;
    constructor(userRepository: UserRepository);
    checkAccessToken(token: string): Promise<User>;
    getAll(): Promise<User[]>;
}
export declare function checkAccessToken(token: string, userRepo: UserRepository): Promise<User>;

import { AuthenticationStrategy } from '@loopback/authentication';
import { securityId, UserProfile } from '@loopback/security';
import { UserService } from '../../services';
import { Request } from "express-serve-static-core";
export interface UserProfileDescription {
    [securityId]: string;
    permissions: {
        switch: boolean;
    };
}
export declare class CsTokenStrategy implements AuthenticationStrategy {
    userService: UserService;
    name: string;
    constructor(userService: UserService);
    authenticate(request: Request): Promise<UserProfile | undefined>;
}

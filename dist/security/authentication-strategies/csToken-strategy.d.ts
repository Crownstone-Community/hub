/// <reference types="express" />
import { Request } from '@loopback/rest';
import { AuthenticationStrategy } from '@loopback/authentication';
import { securityId, UserProfile } from '@loopback/security';
import { UserService } from '../../services';
export interface UserProfileDescription {
    [securityId]: string;
    permissions: {
        switch: boolean;
    };
    sphereRole: sphereRole;
}
declare type sphereRole = "admin" | "member" | "guest" | "hub";
export declare class CsTokenStrategy implements AuthenticationStrategy {
    userService: UserService;
    name: string;
    constructor(userService: UserService);
    authenticate(request: Request): Promise<UserProfile | undefined>;
}
export declare function extractToken(request: Request): string;
export {};

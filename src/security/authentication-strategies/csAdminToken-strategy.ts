
import {HttpErrors} from '@loopback/rest';
import {AuthenticationStrategy} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';
import {UserService} from '../../services';
import {inject} from '@loopback/context';
import {Request} from "express-serve-static-core";
import {extractToken} from './csToken-strategy';
import {SecurityTypes} from '../../constants/Constants';


export interface UserProfileDescription {
  [securityId] : string,
  permissions: {
    switch: boolean
  },
  sphereRole: sphereRole
}
type sphereRole = "admin" | "member" | "guest" | "hub"

export class CsAdminTokenStrategy implements AuthenticationStrategy {
  name = SecurityTypes.admin;

  constructor(
    @inject('UserService') public userService: UserService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    let access_token = extractToken(request);
    let user = await this.userService.checkAccessToken(access_token)
    if (user.sphereRole !== 'admin') {
      throw new HttpErrors.Unauthorized("Admin access required.");
    }
    let userProfile : UserProfileDescription = {
      [securityId]: user.id,
      permissions: {
        switch: true
      },
      sphereRole: user.sphereRole as sphereRole
    }
    return userProfile;
  }
}
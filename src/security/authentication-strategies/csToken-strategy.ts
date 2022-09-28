
import {HttpErrors, Request} from '@loopback/rest';
import {AuthenticationStrategy} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';
import {UserService} from '../../services';
import {inject} from '@loopback/context';
import {SecurityTypes} from '../../constants/Constants';


export interface UserProfileDescription {
  [securityId] : string,
  permissions: {
    switch: boolean
  },
  sphereRole: sphereRole
}
type sphereRole = "admin" | "member" | "guest" | "hub"

export class CsTokenStrategy implements AuthenticationStrategy {
  name = SecurityTypes.sphere;

  constructor(
    @inject('UserService') public userService: UserService,
  ) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    let access_token = extractToken(request);
    let user = await this.userService.checkAccessToken(access_token)

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


export function extractToken(request:Request) : string {
  let access_token : string = String(
    request.header('access_token') ||
    request.header('Authorization') ||
    request.query.access_token
  );

  if (!access_token) {
    throw new HttpErrors.Unauthorized(`Access token not found.`);
  }
  return access_token
}

import {HttpErrors, Request} from '@loopback/rest';
import {AuthenticationStrategy, TokenService} from '@loopback/authentication';
import {securityId, UserProfile} from '@loopback/security';
import {UserService} from '../../services';
import {inject} from '@loopback/context';

export class CsTokenStrategy implements AuthenticationStrategy {
  name = 'csTokens';

  constructor(
    @inject('services.UserService')
    public userService: UserService,
  ) {
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    if (!request.query.access_token) {
      throw new HttpErrors.Unauthorized(`Access token not found.`);
    }
    let token = request.query.access_token;
    let user = await this.userService.checkAccessToken(token)

    let userProfile : UserProfile = {
      [securityId]: user.id,
      permissions: {
        switch: true
      }
    }
    return userProfile;
  }


}

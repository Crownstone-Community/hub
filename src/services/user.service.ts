import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import {User} from '../models';
import {HttpErrors} from '@loopback/rest/dist';

export class UserService {
  constructor(@repository(UserRepository) public userRepository: UserRepository) {}

  async checkAccessToken(token: string): Promise<User> {
    const invalidCredentialsError = 'Invalid AccessToken.';

    const foundUser = await this.userRepository.findOne({
      where: {userToken: token},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }


  async mock() {
    return this.userRepository.create({userId:"tetst", userToken:"666"})
  }

  async getAll() {
    return this.userRepository.find()
  }

}

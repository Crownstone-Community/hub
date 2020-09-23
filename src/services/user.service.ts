import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import {User} from '../models';
import {HttpErrors} from '@loopback/rest/dist';

export class UserService {
  constructor(@repository(UserRepository) public userRepository: UserRepository) {}

  async checkAccessToken(token: string): Promise<User> {
    return checkAccessToken(token, this.userRepository);
  }

  async getAll() {
    return this.userRepository.find()
  }
}


export async function checkAccessToken(token:string, userRepo : UserRepository) : Promise<User> {
  const invalidCredentialsError = 'Invalid AccessToken.';

  const foundUser = await userRepo.findOne({
    where: {userToken: token},
  });
  if (!foundUser) {
    throw new HttpErrors.Unauthorized(invalidCredentialsError);
  }

  return foundUser;
}
// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';

import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import {get, param, post} from '@loopback/rest';
import {User} from '../models';
import {UserService} from '../services';
import {inject} from '@loopback/context';

/**
 * This controller will echo the state of the hub.
 */

export class UserController {
  constructor(
    @repository(UserRepository) protected userRepo: UserRepository,
    @inject("UserService")
    public userService: UserService,
  ) {}

  // returns a list of our objects
  @get('/user')
  async getUsers(): Promise<User[]> {
    return this.userRepo.find(); // a CRUD method from our repository
  }

  // returns a list of our objects
  @post('/mock')
  async mock(): Promise<User> {
    return await this.userService.mock(); // a CRUD method from our repository
  }
}

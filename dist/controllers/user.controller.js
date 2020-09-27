"use strict";
// // Uncomment these imports to begin using these cool features!
//
// // import {inject} from '@loopback/context';
//
// import {repository} from '@loopback/repository';
// import {get} from '@loopback/rest';
// import {UserService} from '../services';
// import {inject} from '@loopback/context';
// import {UserRepository} from '../repositories/user.repository';
// import {User} from '../models/user.model';
// import {authenticate} from '@loopback/authentication';
// import {SecurityBindings, securityId} from '@loopback/security';
// import {UserProfileDescription} from '../security/authentication-strategies/csToken-strategy';
//
// /**
//  * This controller will echo the state of the hub.
//  */
//
// export class UserController {
//   constructor(
//     @repository(UserRepository) protected userRepo: UserRepository,
//     @inject("UserService")
//     public userService: UserService,
//   ) {}
//
//   // returns a list of our objects
//   @get('/user')
//   async getUsers(): Promise<User[]> {
//     return this.userRepo.find(); // a CRUD method from our repository
//   }
//
//   // returns a list of our objects
//   @get('/isAuthenticated')
//   @authenticate(SecurityTypes.sphere)
//   async isAuthenticated(
//     @inject(SecurityBindings.USER) userProfile : UserProfileDescription,
//   ): Promise<string> {
//     return userProfile[securityId];
//   }
// }
//# sourceMappingURL=user.controller.js.map
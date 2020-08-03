"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const repositories_1 = require("../repositories");
const dist_1 = require("@loopback/rest/dist");
let UserService = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async checkAccessToken(token) {
        const invalidCredentialsError = 'Invalid AccessToken.';
        const foundUser = await this.userRepository.findOne({
            where: { userToken: token },
        });
        if (!foundUser) {
            throw new dist_1.HttpErrors.Unauthorized(invalidCredentialsError);
        }
        return foundUser;
    }
    async mock() {
        return this.userRepository.create({ userId: "tetst", userToken: "666" });
    }
    async getAll() {
        return this.userRepository.find();
    }
};
UserService = tslib_1.__decorate([
    tslib_1.__param(0, repository_1.repository(repositories_1.UserRepository)),
    tslib_1.__metadata("design:paramtypes", [repositories_1.UserRepository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map
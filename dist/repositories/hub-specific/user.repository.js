"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: loopback4-example-shopping
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
const core_1 = require("@loopback/core");
const user_permission_repository_1 = require("./user-permission.repository");
const dist_1 = require("@loopback/rest/dist");
const models_1 = require("../../models");
let UserRepository = class UserRepository extends repository_1.DefaultCrudRepository {
    constructor(datasource, userPermissionRepository) {
        super(models_1.User, datasource);
        this.datasource = datasource;
        this.userPermissionRepository = userPermissionRepository;
        this.permissions = this.createHasManyRepositoryFactoryFor('permissions', async () => userPermissionRepository);
    }
    async create(entity, options) {
        await this.checkUniqueness(entity);
        return super.create(entity, options);
    }
    async checkUniqueness(entity) {
        let tokenUniqueness = await this.findOne({ where: { userToken: entity.userToken }, fields: { id: true } });
        if (tokenUniqueness !== null) {
            throw new dist_1.HttpErrors.UnprocessableEntity("UserToken already exists!");
        }
    }
    async merge(cloudUserData, tokenData) {
        let userData = {};
        let matchingCloudIdMap = {};
        let currentUsers = await this.find();
        function prepareUser(sphereUser) {
            return {
                userId: sphereUser.id,
                userToken: tokenData[sphereUser.id].token,
                firstName: sphereUser.firstName,
                lastName: sphereUser.lastName,
                sphereRole: tokenData[sphereUser.id].role
            };
        }
        cloudUserData.admins.forEach((user) => { userData[user.id] = prepareUser(user); matchingCloudIdMap[user.id] = false; });
        cloudUserData.members.forEach((user) => { userData[user.id] = prepareUser(user); matchingCloudIdMap[user.id] = false; });
        cloudUserData.guests.forEach((user) => { userData[user.id] = prepareUser(user); matchingCloudIdMap[user.id] = false; });
        for (let i = 0; i < currentUsers.length; i++) {
            let user = currentUsers[i];
            let data = userData[user.userId];
            if (data !== undefined) {
                matchingCloudIdMap[user.userId] = true;
                if (data.userToken) {
                    user.userToken = data.userToken;
                }
                if (data.sphereRole) {
                    user.sphereRole = data.sphereRole;
                }
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                await this.update(user);
            }
            else {
                await this.delete(user);
            }
        }
        let matchingCloudIds = Object.keys(matchingCloudIdMap);
        for (let i = 0; i < matchingCloudIds.length; i++) {
            let id = matchingCloudIds[i];
            if (matchingCloudIdMap[id] === false) {
                await this.create(userData[id]);
            }
        }
    }
};
UserRepository = tslib_1.__decorate([
    tslib_1.__param(0, core_1.inject('datasources.mongo')),
    tslib_1.__param(1, repository_1.repository(user_permission_repository_1.UserPermissionRepository)),
    tslib_1.__metadata("design:paramtypes", [repository_1.juggler.DataSource, user_permission_repository_1.UserPermissionRepository])
], UserRepository);
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map
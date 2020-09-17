"use strict";
// Uncomment these imports to begin using these cool features!
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshController = void 0;
const tslib_1 = require("tslib");
// import {inject} from '@loopback/context';
const rest_1 = require("@loopback/rest");
const CrownstoneHub_1 = require("../crownstone/CrownstoneHub");
const authentication_1 = require("@loopback/authentication");
class MeshController {
    constructor() { }
    async switchCrownstones() {
        return CrownstoneHub_1.CrownstoneHub.mesh.topology.crownstonesInMesh;
    }
}
tslib_1.__decorate([
    rest_1.get('/stonesInMesh'),
    authentication_1.authenticate('csTokens'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], MeshController.prototype, "switchCrownstones", null);
exports.MeshController = MeshController;
//# sourceMappingURL=mesh.controller.js.map
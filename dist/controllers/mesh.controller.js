"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshController = void 0;
const tslib_1 = require("tslib");
const rest_1 = require("@loopback/rest");
const CrownstoneHub_1 = require("../crownstone/CrownstoneHub");
const authentication_1 = require("@loopback/authentication");
const Constants_1 = require("../constants/Constants");
const MemoryDb_1 = require("../crownstone/data/MemoryDb");
class MeshController {
    constructor() { }
    async getCrownstonesInMesh() {
        let topology = { ...CrownstoneHub_1.CrownstoneHub.mesh.network.crownstonesInMesh };
        let result = [];
        Object.keys(topology).forEach((uid) => {
            let data = (0, MemoryDb_1.fillWithStoneData)(uid);
            data.lastSeen = new Date(topology[uid]);
            data.lastSeenSwitchState = null;
            if (data.cloudId) {
                let switchState = CrownstoneHub_1.CrownstoneHub.mesh.switch.lastSwitchStates[uid];
                if (switchState === undefined) {
                    switchState = null;
                }
                else {
                    switchState = Number(switchState);
                }
                data.lastSeenSwitchState = switchState;
            }
            result.push(data);
        });
        return result;
    }
    async getTopology() {
        let edges = Object.values(CrownstoneHub_1.CrownstoneHub.mesh.network.topology);
        let nodes = MemoryDb_1.MemoryDb.stones;
        let locations = MemoryDb_1.MemoryDb.locationByCloudId;
        return { edges, nodes, locations };
    }
    async getStatistics() {
        return CrownstoneHub_1.CrownstoneHub.mesh.network.lossStatistics;
    }
    async refreshTopology() {
        await CrownstoneHub_1.CrownstoneHub.uart.refreshMeshTopology();
        CrownstoneHub_1.CrownstoneHub.mesh.network.resetTopology();
    }
}
tslib_1.__decorate([
    (0, rest_1.get)('/network/crownstones'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.sphere),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], MeshController.prototype, "getCrownstonesInMesh", null);
tslib_1.__decorate([
    (0, rest_1.get)('/network'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.sphere),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], MeshController.prototype, "getTopology", null);
tslib_1.__decorate([
    (0, rest_1.get)('/network/statistics'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.sphere),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], MeshController.prototype, "getStatistics", null);
tslib_1.__decorate([
    (0, rest_1.post)('/network/refreshTopology'),
    (0, authentication_1.authenticate)(Constants_1.SecurityTypes.sphere),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], MeshController.prototype, "refreshTopology", null);
exports.MeshController = MeshController;
//# sourceMappingURL=mesh.controller.js.map
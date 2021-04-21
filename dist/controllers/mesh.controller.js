"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshController = void 0;
const tslib_1 = require("tslib");
const rest_1 = require("@loopback/rest");
const CrownstoneHub_1 = require("../crownstone/CrownstoneHub");
const authentication_1 = require("@loopback/authentication");
const Constants_1 = require("../constants/Constants");
const MemoryDb_1 = require("../crownstone/Data/MemoryDb");
class MeshController {
    constructor() { }
    async getCrownstonesInMesh() {
        let topology = { ...CrownstoneHub_1.CrownstoneHub.mesh.topology.crownstonesInMesh };
        let result = [];
        Object.keys(topology).forEach((uid) => {
            let data = MemoryDb_1.fillWithStoneData(uid);
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
}
tslib_1.__decorate([
    rest_1.get('/crownstonesInMesh'),
    authentication_1.authenticate(Constants_1.SecurityTypes.sphere),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], MeshController.prototype, "getCrownstonesInMesh", null);
exports.MeshController = MeshController;
//# sourceMappingURL=mesh.controller.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_DATABASE = exports.DbRef = void 0;
class DbReferenceClass {
}
exports.DbRef = new DbReferenceClass();
async function EMPTY_DATABASE() {
    await exports.DbRef.hub.deleteAll();
    await exports.DbRef.user.deleteAll();
    await exports.DbRef.userPermission.deleteAll();
    await exports.DbRef.power.deleteAll();
    await exports.DbRef.energy.deleteAll();
    await exports.DbRef.energyProcessed.deleteAll();
    await exports.DbRef.switches.deleteAll();
    await exports.DbRef.sphereFeatures.deleteAll();
}
exports.EMPTY_DATABASE = EMPTY_DATABASE;
//# sourceMappingURL=DbReference.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubStatusManager = void 0;
const CrownstoneHub_1 = require("../CrownstoneHub");
class HubStatusManagerClass {
    constructor() {
        this.encryptionRequired = false;
        this.clientHasBeenSetup = false;
        this.clientHasInternet = false;
        this.clientHasError = false;
    }
    async setStatus(hubStatus) {
        var _a, _b, _c, _d;
        this.encryptionRequired = (_a = hubStatus.encryptionRequired) !== null && _a !== void 0 ? _a : this.encryptionRequired;
        this.clientHasBeenSetup = (_b = hubStatus.clientHasBeenSetup) !== null && _b !== void 0 ? _b : this.clientHasBeenSetup;
        this.clientHasInternet = (_c = hubStatus.clientHasInternet) !== null && _c !== void 0 ? _c : this.clientHasInternet;
        this.clientHasError = (_d = hubStatus.clientHasError) !== null && _d !== void 0 ? _d : this.clientHasError;
        await CrownstoneHub_1.CrownstoneHub.uart.connection.hub.setStatus(hubStatus);
    }
    async setActualStatus() {
        await CrownstoneHub_1.CrownstoneHub.uart.connection.hub.setStatus({
            encryptionRequired: this.encryptionRequired,
            clientHasBeenSetup: this.clientHasBeenSetup,
            clientHasInternet: this.clientHasInternet,
            clientHasError: this.clientHasError,
        });
    }
}
exports.HubStatusManager = new HubStatusManagerClass();
//# sourceMappingURL=HubStatusManager.js.map
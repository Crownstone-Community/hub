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
        this.encryptionRequired = hubStatus.encryptionRequired ?? this.encryptionRequired;
        this.clientHasBeenSetup = hubStatus.clientHasBeenSetup ?? this.clientHasBeenSetup;
        this.clientHasInternet = hubStatus.clientHasInternet ?? this.clientHasInternet;
        this.clientHasError = hubStatus.clientHasError ?? this.clientHasError;
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
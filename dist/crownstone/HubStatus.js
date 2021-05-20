"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetHubStatus = exports.HubStatus = void 0;
// @ts-ignore
exports.HubStatus = {};
resetHubStatus();
function resetHubStatus() {
    exports.HubStatus = {
        initialized: false,
        loggedIntoCloud: false,
        loggedIntoSSE: false,
        syncedWithCloud: false,
        uartReady: false,
        belongsToSphere: 'none'
    };
}
exports.resetHubStatus = resetHubStatus;
//# sourceMappingURL=HubStatus.js.map
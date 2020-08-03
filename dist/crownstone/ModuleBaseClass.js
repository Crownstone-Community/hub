"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleBase = void 0;
class ModuleBase {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    // This is the one to overload. It should set the ready boolean when it is finished.
    initialize() {
        return Promise.resolve();
    }
}
exports.ModuleBase = ModuleBase;
//# sourceMappingURL=ModuleBaseClass.js.map
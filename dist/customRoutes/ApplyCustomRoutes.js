"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCustomRoutes = void 0;
const LoggingRoutes_1 = require("./LoggingRoutes");
const VisualizationRoutes_1 = require("./VisualizationRoutes");
const DebugRoutes_1 = require("./DebugRoutes");
function applyCustomRoutes(app, loopbackApp) {
    LoggingRoutes_1.addLoggingRoutes(app, loopbackApp);
    DebugRoutes_1.addDebugRoutes(app, loopbackApp);
    VisualizationRoutes_1.addVisualizationRoutes(app, loopbackApp);
}
exports.applyCustomRoutes = applyCustomRoutes;
//# sourceMappingURL=ApplyCustomRoutes.js.map
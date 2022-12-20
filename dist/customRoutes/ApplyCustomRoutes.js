"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCustomRoutes = void 0;
const LoggingRoutes_1 = require("./LoggingRoutes");
const VisualizationRoutes_1 = require("./VisualizationRoutes");
const DeveloperRoutes_1 = require("./DeveloperRoutes");
function applyCustomRoutes(app, loopbackApp) {
    (0, LoggingRoutes_1.addLoggingRoutes)(app, loopbackApp);
    (0, DeveloperRoutes_1.addDeveloperRoutes)(app, loopbackApp);
    (0, VisualizationRoutes_1.addVisualizationRoutes)(app, loopbackApp);
}
exports.applyCustomRoutes = applyCustomRoutes;
//# sourceMappingURL=ApplyCustomRoutes.js.map
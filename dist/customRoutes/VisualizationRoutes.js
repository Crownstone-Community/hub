"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVisualizationRoutes = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
function addVisualizationRoutes(app, loopbackApp) {
    app.get('/energy', async (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../../public/energyViewer/index.html'));
    });
}
exports.addVisualizationRoutes = addVisualizationRoutes;
//# sourceMappingURL=VisualizationRoutes.js.map
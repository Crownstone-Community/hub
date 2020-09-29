"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVisualizationRoutes = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const rest_1 = require("@loopback/rest");
function addVisualizationRoutes(app, loopbackApp) {
    app.get('/vis', async (req, res) => {
        try {
            // let access_token = extractToken(req);
            // let userData = await checkAccessToken(access_token, DbRef.user);
            // if (userData) {
            res.sendFile(path_1.default.join(__dirname, '../public/energyViewer/index.html'));
            // }
        }
        catch (e) {
            res.end(JSON.stringify(new rest_1.HttpErrors.Unauthorized()));
        }
    });
}
exports.addVisualizationRoutes = addVisualizationRoutes;
//# sourceMappingURL=Visualization.js.map
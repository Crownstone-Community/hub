"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
exports.CONFIG = {
    configPath: process.env.CS_HUB_CONFIG_PATH,
    sslConfigPath: (_a = process.env.CS_HUB_SLL_CONFIG_PATH) !== null && _a !== void 0 ? _a : "config",
    httpsCertificatePath: process.env.CS_HUB_HTTPS_CERTIFICATE_PATH,
    uartPort: process.env.CS_HUB_UART_PORT,
    useHttp: (_b = process.env.CS_HUB_USE_HTTP) !== null && _b !== void 0 ? _b : true,
    enableUart: (_c = process.env.ENABLE_UART) !== null && _c !== void 0 ? _c : true,
    generateCustomIds: (_d = process.env.GENERATE_CUSTOM_IDS) !== null && _d !== void 0 ? _d : false,
};
//# sourceMappingURL=config.js.map
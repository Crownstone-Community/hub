"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
exports.CONFIG = {
    configPath: process.env.CS_HUB_CONFIG_PATH,
    sslConfigPath: process.env.CS_HUB_SLL_CONFIG_PATH || "config",
    httpsCertificatePath: process.env.CS_HUB_HTTPS_CERTIFICATE_PATH,
    uartPort: process.env.CS_HUB_UART_PORT
};
//# sourceMappingURL=config.js.map
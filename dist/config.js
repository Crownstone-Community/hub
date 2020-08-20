"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
exports.CONFIG = {
    sslConfigPath: process.env.CS_HUB_DEFAULT_CONFIG_PATH || "config",
    httpsCertificatePath: process.env.CS_HUB_HTTPS_CERTIFICATE_PATH,
    uartPort: process.env.CS_HUB_UART_PORT
};
//# sourceMappingURL=config.js.map
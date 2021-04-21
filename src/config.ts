export const CONFIG = {
  configPath:           process.env.CS_HUB_CONFIG_PATH,
  sslConfigPath:        process.env.CS_HUB_SLL_CONFIG_PATH ?? "config",
  httpsCertificatePath: process.env.CS_HUB_HTTPS_CERTIFICATE_PATH,
  uartPort:             process.env.CS_HUB_UART_PORT,

  useHttp:              process.env.CS_HUB_USE_HTTP ?? true,
  enableUart:           process.env.ENABLE_UART ?? true,

  generateCustomIds:    process.env.GENERATE_CUSTOM_IDS ?? false,
}
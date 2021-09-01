
interface HubConfig {
  useDevControllers: boolean,
  useLogControllers: boolean,
  logging: HubLogConfig,
  developerOptions: HubDevOptions
}

interface HubDevOptions {
  actOnSwitchCommands: boolean
}

interface HubPortConfig {
  httpPort?: number,
  enableHttp?: boolean,
  httpsPort?: number
}

interface HubLogConfig {
  [loggerId: string] : {console: TransportLevel, file: TransportLevel}
}
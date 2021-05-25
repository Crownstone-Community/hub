type HubData = HubData_setup | HubData_requestData | HubData_factoryReset | HubData_factoryResetHubOnly;

interface HubData_setup {
  type: 0,
  token: string,
  cloudId: string;
}

interface HubData_requestData {
  type: 10,
  requestedType: number
}

interface HubData_factoryReset {
  type: 2,
}

interface HubData_factoryResetHubOnly {
  type: 3,
}


interface HubDataType {
  SETUP:                  0,
  COMMAND:                1,
  FACTORY_RESET:          2,
  FACTORY_RESET_HUB_ONLY: 3,
  REQUEST_DATA:           10,
}

interface HubReplyError {
  NOT_IN_SETUP_MODE: 0,
  IN_SETUP_MODE:     1,
  INVALID_TOKEN:     2,
  INVALID_MESSAGE:   100,
  UNKNOWN:           60000,
}

interface HubReplyCode {
  SUCCESS:    0,
  DATA_REPLY: 10,
  ERROR:      4000
}

interface HubRequestDataType {
  CLOUD_ID: 0
}

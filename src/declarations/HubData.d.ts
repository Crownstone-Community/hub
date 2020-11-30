type HubData = HubData_setup | HubData_requestData;

interface HubData_setup {
  type: 0,
  token: string,
  cloudId: string;
}

interface HubData_requestData {
  type: 10,
  requestedType: number
}


interface HubDataType {
  SETUP:         0,
  COMMAND:       1,
  FACTORY_RESET: 2,
  REQUEST_DATA:  10,
}

interface HubReplyError {
  NOT_IN_SETUP_MODE: 0,
  INVALID_TOKEN:     1,
  IN_SETUP_MODE:     10,
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
import {CONFIG} from '../config';
import fs from "fs";
import {Util} from './Util';
import path from 'path';
import {Logger} from '../Logger';

const log = Logger(__filename);

interface HubConfig {
  useDevControllers: boolean,
  useLogControllers: boolean,
  logging: HubLogConfig
}

interface HubLogConfig {
  [loggerId: string] : {console: TransportLevel, file: TransportLevel}
}

const defaultConfig : HubConfig = {
  useDevControllers: false,
  useLogControllers: false,

  logging: {}
}

function checkObject(candidate : any, example : any) {
  let keys = Object.keys(example);
  for (let i = 0; i < keys.length; i++) {
    if (typeof example[keys[i]] === 'object' ) {
      if (candidate[keys[i]] === undefined || typeof candidate[keys[i]] !== 'object') {
        // @ts-ignore
        candidate[keys[i]] = {...example[keys[i]]};
      }
      else {
        checkObject(candidate[keys[i]], example[keys[i]]);
      }
    }
    else if (candidate[keys[i]] === undefined) {
      // @ts-ignore
      candidate[keys[i]] = example[keys[i]];
    }
  }
}

export function getHubConfig() : HubConfig {
  let configPath = getConfigPath();
  let dataObject: any = {};
  if (fs.existsSync(configPath)) {
    let data = fs.readFileSync(configPath, 'utf-8');
    if (data && typeof data === 'string') {
      dataObject = JSON.parse(data);
    }
  }
  checkObject(dataObject, defaultConfig);
  return dataObject;
}

function getConfigPath() {
  let configPath = Util.stripTrailingSlash(CONFIG.configPath || (Util.stripTrailingSlash(__dirname) + "/config"));

  let pathExists = fs.existsSync(configPath)
  if (!pathExists) {
    fs.mkdirSync(configPath);
  }
  return path.join(configPath, 'hub_config.json');
}

export function storeHubConfig(config : HubConfig) {
  let configPath = getConfigPath();
  let str = JSON.stringify(config);
  fs.writeFileSync(configPath, str)
}
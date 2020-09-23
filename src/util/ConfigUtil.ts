import {CONFIG} from '../config';
import fs from "fs";
import {Util} from './Util';
import path from 'path';


interface HubConfig {
  useDevControllers: boolean
  useLogControllers: boolean,
}

const defaultConfig : HubConfig = {
  useDevControllers: false,
  useLogControllers: false,
}

export function getHubConfig() : HubConfig {
  let configPath = getConfigPath();
  let dataObject: any = {};
  if (fs.existsSync(configPath)) {
    let data = fs.readFileSync(configPath);
    if (data && typeof data === 'string') {
      dataObject = JSON.parse(data);
    }

    let keys = Object.keys(defaultConfig);
    for (let i = 0; i < keys.length; i++) {
      if (dataObject[keys[i]] === undefined) {
        // @ts-ignore
        dataObject[keys[i]] = defaultConfig[keys[i]];
      }
    }
  }
  else {
    dataObject = {...defaultConfig};
  }
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
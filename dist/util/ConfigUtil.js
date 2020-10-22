"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeHubConfig = exports.getHubConfig = void 0;
const tslib_1 = require("tslib");
const config_1 = require("../config");
const fs_1 = tslib_1.__importDefault(require("fs"));
const Util_1 = require("./Util");
const path_1 = tslib_1.__importDefault(require("path"));
const Logger_1 = require("../Logger");
const log = Logger_1.Logger(__filename);
const defaultConfig = {
    useDevControllers: false,
    useLogControllers: false,
    logging: {}
};
function checkObject(candidate, example) {
    let keys = Object.keys(example);
    for (let i = 0; i < keys.length; i++) {
        if (typeof example[keys[i]] === 'object') {
            if (candidate[keys[i]] === undefined || typeof candidate[keys[i]] !== 'object') {
                // @ts-ignore
                candidate[keys[i]] = { ...example[keys[i]] };
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
function getHubConfig() {
    let configPath = getConfigPath();
    let dataObject = {};
    if (fs_1.default.existsSync(configPath)) {
        let data = fs_1.default.readFileSync(configPath, 'utf-8');
        if (data && typeof data === 'string') {
            dataObject = JSON.parse(data);
        }
    }
    checkObject(dataObject, defaultConfig);
    return dataObject;
}
exports.getHubConfig = getHubConfig;
function getConfigPath() {
    let configPath = Util_1.Util.stripTrailingSlash(config_1.CONFIG.configPath || (Util_1.Util.stripTrailingSlash(__dirname) + "/config"));
    let pathExists = fs_1.default.existsSync(configPath);
    if (!pathExists) {
        fs_1.default.mkdirSync(configPath);
    }
    return path_1.default.join(configPath, 'hub_config.json');
}
function storeHubConfig(config) {
    let configPath = getConfigPath();
    let str = JSON.stringify(config);
    fs_1.default.writeFileSync(configPath, str);
}
exports.storeHubConfig = storeHubConfig;
//# sourceMappingURL=ConfigUtil.js.map
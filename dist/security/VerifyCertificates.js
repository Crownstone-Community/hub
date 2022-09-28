"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCertificate = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const child_process_1 = require("child_process");
const config_1 = require("../config");
const path_1 = tslib_1.__importDefault(require("path"));
async function verifyCertificate() {
    let certificatePath = (config_1.CONFIG.httpsCertificatePath && path_1.default.join(config_1.CONFIG.httpsCertificatePath, 'https')) || path_1.default.join(__dirname, '../../config/https');
    let pathExists = fs.existsSync(certificatePath);
    if (!pathExists) {
        fs.mkdirSync(certificatePath);
    }
    let certificateFolderContent = fs.readdirSync(certificatePath);
    if (certificateFolderContent.indexOf("key.pem") == -1 || certificateFolderContent.indexOf("cert.pem") == -1) {
        await generateSelfSignedCertificatePair(certificatePath);
    }
    return certificatePath;
}
exports.verifyCertificate = verifyCertificate;
async function generateSelfSignedCertificatePair(dir) {
    console.log("Generating self-signed certificate pair...");
    let confPath = config_1.CONFIG.sslConfigPath;
    let command = "req -config " + confPath + "/openssl-hub.conf -new -nodes -x509 -days 18500 -keyout " + dir + "/key.pem -out " + dir + "/cert.pem";
    return new Promise((resolve, reject) => {
        // @ts-ignore
        runOpenSSLCommand(command, (something, other) => {
            console.log("Generated self-signed certificate pair!", something, other);
            resolve();
        });
    });
}
/**
 * The methods below have been taken and adapted from https://github.com/lspiehler/node-openssl-cert
 * @param command
 */
let normalizeCommand = function (command) {
    let cmd = command.split(' ');
    let outcmd = [];
    let cmdbuffer = [];
    for (let i = 0; i <= cmd.length - 1; i++) {
        if (cmd[i].charAt(cmd[i].length - 1) == '\\') {
            cmdbuffer.push(cmd[i]);
        }
        else {
            if (cmdbuffer.length > 0) {
                outcmd.push(cmdbuffer.join(' ') + ' ' + cmd[i]);
                cmdbuffer.length = 0;
            }
            else {
                outcmd.push(cmd[i]);
            }
        }
    }
    return outcmd;
};
let runOpenSSLCommand = function (cmd, callback) {
    const stdoutbuff = [];
    const stderrbuff = [];
    let terminate = false;
    const shell = (0, child_process_1.spawn)('openssl', normalizeCommand(cmd));
    console.log("openssl", cmd);
    shell.stderr.on('data', function (data) {
        stderrbuff.push(data.toString());
        // console.log(data.toString())
    });
    shell.on('exit', function (code) {
        console.log("EXIT", code, 'openssl ' + cmd);
        if (terminate && code == null) {
            code = 0;
        }
        let out = {
            command: 'openssl ' + cmd,
            stdout: stdoutbuff.join(''),
            stderr: stderrbuff.join(''),
            exitcode: code
        };
        if (code != 0) {
            callback(stderrbuff.join(), out);
        }
        else {
            callback(false, out);
        }
    });
};
//# sourceMappingURL=VerifyCertificates.js.map
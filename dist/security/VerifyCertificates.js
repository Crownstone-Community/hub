"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCertificate = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const child_process_1 = require("child_process");
async function verifyCertificate() {
    let certificatePath = stripTrailingSlash(process.env.HTTPS_CERTIFICATE_PATH || stripTrailingSlash(__dirname) + "/https");
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
function stripTrailingSlash(path) {
    if (path[path.length - 1] === '/') {
        return path.substr(0, path.length - 1);
    }
    return path;
}
async function generateSelfSignedCertificatePair(dir) {
    console.log(process.cwd());
    console.log(__dirname);
    console.log("Generating self-signed certificate pair...");
    let confPath = process.env.DEFUALT_CONFIG_PATH || "config";
    let command = "req -config " + confPath + "/openssl-hub.conf -new -nodes -x509 -days 18500 -keyout " + dir + "/key.pem -out " + dir + "/cert.pem";
    //let input = ["NL", "Zuid-Holland", "Rotterdam", "Crownstone", "Hub v1", "", "ask@crownstone.rocks"];
    let input = [];
    return new Promise((resolve, reject) => {
        // @ts-ignore
        runOpenSSLCommand(command, input.reverse(), (something, other) => {
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
let runOpenSSLCommand = function (cmd, input, callback) {
    const stdoutbuff = [];
    const stderrbuff = [];
    let terminate = false;
    const shell = child_process_1.spawn('openssl', normalizeCommand(cmd));
    let writeTimeout = null;
    shell.stderr.on('data', function (data) {
        clearTimeout(writeTimeout);
        writeTimeout = setTimeout(function () {
            if (input.length > 0) {
                shell.stdin.write(input[input.length - 1] + "\n");
                input.pop();
            }
            else {
                shell.stdin.write("\n");
            }
        }, 300);
        stderrbuff.push(data.toString());
    });
    shell.on('exit', function (code) {
        clearTimeout(writeTimeout);
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
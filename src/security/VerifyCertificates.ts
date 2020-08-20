import * as fs from "fs";
import {spawn} from "child_process";
import {CONFIG} from '../config';


export async function verifyCertificate() : Promise<string> {
  let certificatePath = stripTrailingSlash(CONFIG.httpsCertificatePath || stripTrailingSlash(__dirname) + "/https");

  let pathExists = fs.existsSync(certificatePath)
  if (!pathExists) {
    fs.mkdirSync(certificatePath);
  }
  let certificateFolderContent = fs.readdirSync(certificatePath)

  if (certificateFolderContent.indexOf("key.pem") == -1 || certificateFolderContent.indexOf("cert.pem") == -1) {
    await generateSelfSignedCertificatePair(certificatePath);
  }
  return certificatePath;
}

function stripTrailingSlash(path: string) : string {
  if (path[path.length-1] === '/') {
    return path.substr(0,path.length-1);
  }
  return path;
}

async function generateSelfSignedCertificatePair(dir: string) {
  console.log("Generating self-signed certificate pair...")
  let confPath = CONFIG.sslConfigPath || "config";
  let command = "req -config " + confPath + "/openssl-hub.conf -new -nodes -x509 -days 18500 -keyout " + dir + "/key.pem -out " + dir + "/cert.pem";
  return new Promise((resolve, reject) => {
    // @ts-ignore
    runOpenSSLCommand(command,(something, other) => {
      console.log("Generated self-signed certificate pair!", something, other)
      resolve();
    })
  });
}

/**
 * The methods below have been taken and adapted from https://github.com/lspiehler/node-openssl-cert
 * @param command
 */

let normalizeCommand = function(command : string) {
  let cmd = command.split(' ');
  let outcmd = [];
  let cmdbuffer = [];
  for(let i = 0; i <= cmd.length - 1; i++) {
    if(cmd[i].charAt(cmd[i].length - 1) == '\\') {
      cmdbuffer.push(cmd[i]);
    } else {
      if(cmdbuffer.length > 0) {
        outcmd.push(cmdbuffer.join(' ') + ' ' + cmd[i]);
        cmdbuffer.length = 0;
      } else {
        outcmd.push(cmd[i]);
      }
    }
  }
  return outcmd;
}

let runOpenSSLCommand = function(cmd : string, callback : (err : false | any, result: any) => void) {
  const stdoutbuff: string[] = [];
  const stderrbuff: string[] = [];
  let terminate = false;
  const shell = spawn( 'openssl', normalizeCommand(cmd) );

  console.log("openssl",cmd)
  shell.stderr.on('data', function(data) {
    stderrbuff.push(data.toString());
    // console.log(data.toString())
  });

  shell.on('exit', function(code) {
    console.log("EXIT", code, 'openssl ' + cmd,)
    if(terminate && code==null) {
      code = 0;
    }
    let out = {
      command: 'openssl ' + cmd,
      stdout: stdoutbuff.join(''),
      stderr: stderrbuff.join(''),
      exitcode: code
    }
    if (code != 0) {
      callback(stderrbuff.join(), out);
    }
    else {
      callback(false, out);
    }
  });
}

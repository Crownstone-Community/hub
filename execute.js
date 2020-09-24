#! /usr/bin/env node
if (process.env.CS_FILE_LOGGING_DIRNAME === undefined) {
  process.env.CS_FILE_LOGGING_DIRNAME = 'logs'
}

let main = require("./dist/index")
main.main()


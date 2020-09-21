const winston = require('winston');
const util = require('util');

function transform(info : any, opts: any) {
  const args = info[Symbol.for('splat')];
  if (args) { info.message = util.format(info.message, ...args); }
  return info;
}

function utilFormatter() { return {transform}; }

const levels = {
  none:     0,
  critical: 1,
  error:    2,
  warn:     3,
  notice:   4,
  info:     5,
  debug:    6,
  verbose:  7,
  silly:    8
}

const colors = {
  none:     'gray',
  critical: 'bold black redBG',
  error:    'bold red',
  warn:     'orange',
  notice:   'magenta',
  info:     'green',
  debug:    'cyan',
  verbose:  'gray',
  silly:    'white',
}


// @ts-ignore
let formatter = winston.format.printf(({level, message, label, timestamp}) => `${timestamp} ${label || '-'} ${level}: ${message}`)
let myFormat = winston.format.combine(
  winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss.SSS'}),
  utilFormatter(),     // <-- this is what changed
  formatter,
)
const transports = {
  console:new winston.transports.Console({format: winston.format.combine(winston.format.colorize(), myFormat)}),
  file:   new winston.transports.File({ filename: 'error.log', level: 'none', format: myFormat }),
}

winston.addColors(colors);

let LOGGER : any = null;

type logGetter = (filename: string) => ((...args: any[]) => void);

const none : logGetter = function(filename) {
  return function() { LOGGER.none(filename, ...arguments)};
}
const critical : logGetter = function(filename) {
  return function() { LOGGER.critical(filename, ...arguments) };
}
const error : logGetter = function(filename) {
  return function() { LOGGER.error(filename, ...arguments) };
}
const warn : logGetter = function(filename) {
  return function() { LOGGER.warn(filename, ...arguments) };
}
const notice : logGetter = function(filename) {
  return function() { LOGGER.notice(filename, ...arguments) };
}
const info : logGetter = function(filename) {
  return function() { LOGGER.info(filename, ...arguments) };
}
const debug : logGetter = function(filename) {
  return function() { LOGGER.debug(filename, ...arguments) };
}
const verbose : logGetter = function(filename) {
  return function() { LOGGER.verbose(filename, ...arguments) };
}
const silly : logGetter = function(filename) {
  return function() { LOGGER.silly(filename, ...arguments) };
}

export default function generateProjectLogger(projectName: string) {
  return function getLogger(filename: string) {
    if (LOGGER === null) {
      winston.loggers.add(projectName,{
        levels: levels,
        transports: [
          transports.console,
          transports.file,
        ],
      });
      LOGGER = winston.loggers.get(projectName);
    }

    return {
      _logger:     LOGGER,
      _transports: transports,
      none:        none(filename),
      critical:    critical(filename),
      error:       error(filename),
      warn:        warn(filename),
      notice:      notice(filename),
      info:        info(filename),
      debug:       debug(filename),
      verbose:     verbose(filename),
      silly:       silly(filename),
    }
  }
}

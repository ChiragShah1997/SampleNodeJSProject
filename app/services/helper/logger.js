const winston = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, printf, prettyPrint } = winston.format;

// const transport = new winston.transports.DailyRotateFile({
//   filename: 'application-%DATE%.log',
//   datePattern: 'YYYY-MM-DD-HH',
//   zippedArchive: true,
//   maxSize: '20m',
//   maxFiles: '14d',
// });

// transport.on('rotate', (oldFilename, newFilename) => {
//   // do something fun
// });

const logFormat = printf((info) => {
  return `${info.timestamp} - ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
  format: combine(
    timestamp(),
    prettyPrint(),
    winston.format.splat(),
    winston.format.simple(),
    logFormat,
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;

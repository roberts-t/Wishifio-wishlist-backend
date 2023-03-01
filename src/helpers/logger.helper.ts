const winston = require('winston');
require('winston-mongodb');

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'white',
};

const level = () => {
    const isDev = process.env.NODE_ENV == "DEV";
    return isDev ? 'debug' : 'warn';
};

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info: { timestamp: string; level: string; message: string; }) =>
            `${info.timestamp} [${info.level}]: ${info.message}`,
    ),
);

const transports = [
    (process.env.NODE_ENV == "DEV") && new winston.transports.Console(),
    new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        colorize: false,
        handleExceptions: true,
    }),
    new winston.transports.MongoDB({
        db: process.env.DB_URI,
        collection: 'logs',
        decolorize: true,
        handleExceptions: true,
    }),
];

const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
});

module.exports = logger;
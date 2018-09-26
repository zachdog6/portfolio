"use strict";

var winston = require('winston');

const myFormat = winston.format.printf(info => {
    return `${info.timestamp} ${info.level}: ${info.message}`;
  });

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.File({ filename: 'app.log' })
    ]
});

module.exports = logger;
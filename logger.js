const pino = require('pino')
const pretty = require('pino-pretty')
const logger = pino({level: process.env.LF_LOG_LEVEL || 'info'}, pretty())

module.exports = {logger}

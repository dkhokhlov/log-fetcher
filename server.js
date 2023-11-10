'use strict'
// read .env
require('dotenv').config();
process.env.UV_THREADPOOL_SIZE = process.env.LF_THREADPOOL_SIZE;

const {logger} = require('./logger')
const {checkDirectory, isValidEncoding} = require('./utils')
const {configureRoutes} = require('./routes');
const {assert} = require('./utils')

// print version banner
const package_json = require('./package.json');
logger.info(`log_fetcher v${package_json.version} ${package_json.description}`);

// startup async lambda
const start = async () => {
    try {
        // validate config
        await checkDirectory(process.env.LF_LOG_DIR);
        const chunk_size = parseInt(process.env.LF_CHUNK_SIZE, 10);
        assert(chunk_size > 0, chunk_size, 'Invalid chunk size value');
        assert(isValidEncoding(process.env.LF_FILE_ENCODING));
        // server instance
        const fastify = require('fastify')({logger})
        // configure plugins and routes
        await configureRoutes(fastify, package_json.version);
        // start server
        await fastify.listen({port: process.env.LF_PORT});
        logger.info(`Fastify version: ${fastify.version}`);
        logger.info(`Documentation: http://${fastify.server.address().address}:${fastify.server.address().port}/doc`);
        logger.info(`Metrics: http://${fastify.server.address().address}:${fastify.server.address().port}/metrics`);
        logger.info(`chunk size: ${process.env.LF_CHUNK_SIZE}`);
        logger.info(`log dir: ${process.env.LF_LOG_DIR}`);
    } catch (err) {
        logger.error(err);
        process.exit(2);
    }
};
// run server
start().catch(err => {
    logger.error(err);
    process.exit(3);
});

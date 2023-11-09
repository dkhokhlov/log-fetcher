'use strict'
// read .env
require('dotenv').config();
process.env.UV_THREADPOOL_SIZE = process.env.LF_THREADPOOL_SIZE;

const {logger} = require('./logger')
const {checkDirectory} = require('./utils')
const {configureRoutes} = require('./routes');

// print version banner
const package_json = require('./package.json');
logger.info(`log_fetcher v${package_json.version} ${package_json.description}`);

// startup async lambda
const start = async () => {
    try {
        const fastify = require('fastify')({logger})
        // check log dir
        await checkDirectory(process.env.LF_LOG_DIR);
        // configure plugins and routes
        await configureRoutes(fastify, package_json.version);
        // start server
        await fastify.listen({port: process.env.LF_PORT});
        logger.info(`Fastify version: ${fastify.version}`);
        logger.info(`Documentation: http://${fastify.server.address().address}:${fastify.server.address().port}/doc`);
        logger.info(`Metrics: http://${fastify.server.address().address}:${fastify.server.address().port}/metrics`);
    } catch (err) {
        logger.error(err);
        process.exit(2);
    }
};
// run server
start().catch(error => {
    logger.error(err);
    process.exit(3);
});

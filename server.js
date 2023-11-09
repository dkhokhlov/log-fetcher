'use strict'
// read .env
require('dotenv').config();

const {logger} = require('./logger')
const {checkDirectory} = require('./utils')
const {configureRoutes} = require('./routes');

// print version banner
const package_json = require('./package.json');
logger.info(`log_fetcher v${package_json.version} ${package_json.description}`);
const fastify = require('fastify')({logger})

// startup lambda
const start = async () => {
    try {
        // check log dir
        if (await checkDirectory(process.env.LF_LOG_DIR) === false) {
            logger.error(`Invalid LF_LOG_DIR: ${process.env.LF_LOG_DIR}`);
            process.exit(1);
        }
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
// run the server
start().catch(error => {
    logger.error(err);
    process.exit(3);
});

'use strict'

const dotenv = require('dotenv');
dotenv.config();

const swagger = require('@fastify/swagger');
const fastifyMetrics = require('fastify-metrics');

const log_request_handler = require('./log_request_handler')

const pino = require('pino')
const pretty = require('pino-pretty')
const logger = pino(pretty())

var pjson = require('./package.json');
logger.info(`log_fetcher v${pjson.version} ${pjson.description}`);

const server = require('fastify')({
    logger
})

// '/doc' endpoint
server.register(swagger, {
    exposeRoute: true,
    routePrefix: '/doc',
    swagger: {
        info: {
            title: 'Log Fetcher API',
            description: 'Testing Log Fetcher API',
            version: pjson.version
        }
    }
});

// '/metrics' endpoint
server.register(fastifyMetrics, {
    endpoint: '/metrics'
});

// add main route
server.route({
    method: 'GET',
    url: '/logs',
    schema: {
        querystring: {
            type: 'object',
            properties: { // optional
                filename: {type: 'string', description: 'Name of the log file (optional)'},
                lines: {type: 'integer', description: 'Number of last lines to retrieve (optional)'},
                keyword: {type: 'string', description: 'Keyword to filter log lines (optional)'},
            },
            required: [], // No query params are required, they are all optional
        },
        response: {
            200: {
                type: 'string', // response will be a plain text log line
            }
        }
    },
    handler: async (request, reply) => {
        return await log_request_handler(__dirname, (line) => {
            reply.write(line)
        });
    }
});

// start the server
const start = async () => {
    try {
        await server.listen({port: process.env.LF_PORT});
        server.log.info(`Documentation: http://${server.server.address().address}:${server.server.address().port}/doc`);
        server.log.info(`Metrics: http://${server.server.address().address}:${server.server.address().port}/metrics`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start().then();

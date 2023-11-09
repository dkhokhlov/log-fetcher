'use strict'

const dotenv = require('dotenv');
dotenv.config();

const swagger = require('@fastify/swagger');
const fastifyMetrics = require('fastify-metrics');

const {logs_handler} = require('./logs_handler')

const pino = require('pino')
const pretty = require('pino-pretty')
const logger = pino(pretty())

var pjson = require('./package.json');
logger.info(`log_fetcher v${pjson.version} ${pjson.description}`);
const fastify = require('fastify')({ logger })

const configure_server = async () => {
    // '/doc' endpoint
    await fastify.register(require('@fastify/swagger'))
    await fastify.register(require('@fastify/swagger-ui'), {
        routePrefix: '/doc',
        swagger: {
            info: {
                title: 'Log Fetcher API',
                description: 'Testing Log Fetcher API',
                version: pjson.version
            },
        },
        exposeRoute: true
    })

    // '/metrics' endpoint
    await fastify.register(fastifyMetrics, {
        endpoint: '/metrics'
    });

    // add main route
    await fastify.route({
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
            return await logs_handler(__dirname, (line) => {
                reply.write(line)
            });
        }
    });

    await fastify.ready();
    fastify.swagger();
};
configure_server().catch(error => {
        logger.error(err);
        process.exit(1);
});

// start the server
const start = async () => {
    try {
        await fastify.listen({port: process.env.LF_PORT});
        logger.info(`Fastify version: ${fastify.version}`);
        logger.info(`Documentation: http://${fastify.server.address().address}:${fastify.server.address().port}/doc`);
        logger.info(`Metrics: http://${fastify.server.address().address}:${fastify.server.address().port}/metrics`);
    } catch (err) {
        logger.error(err);
        process.exit(2);
    }
};
start().catch(error => {
        logger.error(err);
        process.exit(3);
});

'use strict'

require('dotenv').config();

const fastifyMetrics = require('fastify-metrics');

const {logger} = require('./logger')
const {logs_handler} = require('./logs_handler')
const {escapeRegexp, checkDirectory} = require('./utils')


var pjson = require('./package.json');
logger.info(`log_fetcher v${pjson.version} ${pjson.description}`);
const fastify = require('fastify')({logger})

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
                    description: 'Log lines: <filename_1>\n<line_1>\n..<line_N>\n\n<file_name2>\n<line_1>..'
                }
            }
        },
        handler: async (request, reply) => {
            let filename_regex;
            if (request.params.filename === undefined) {
                filename_regex = process.env.LF_INCLUDE_REGEX;
            } else {
                filename_regex = '^' + escape_regexp(request.params.filename) + '$';
            }
            const num_lines = request.params.lines;
            const keyword = request.params.keyword;
            const logdir = process.env.LF_LOG_DIR
            return await logs_handler(logdir, RegExp(filename_regex), num_lines, keyword, (text) => {
                reply.send(text)
            });
        }
    });
    await fastify.ready();
    fastify.swagger();
    // check log dir
    if (await checkDirectory(process.env.LF_LOG_DIR) === false) {
        process.exit(2);
    }
};
configure_server().catch(err => {
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
        process.exit(3);
    }
};
start().catch(error => {
    logger.error(err);
    process.exit(4);
});

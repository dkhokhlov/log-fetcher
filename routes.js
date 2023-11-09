const {logs_handler} = require('./logs_handler')
const {escapeRegexp} = require('./utils')

/**
 * Configure fastify plugins and routes
 * @param fastify
 * @param version
 * @returns {Promise<void>}
 */
async function configureRoutes(fastify, version) {

    // '/doc' endpoint
    await fastify.register(require('@fastify/swagger'))
    await fastify.register(require('@fastify/swagger-ui'), {
        routePrefix: '/doc',
        swagger: {
            info: {
                title: 'Log Fetcher API',
                description: 'Testing Log Fetcher API',
                version: version
            },
        },
        exposeRoute: true
    })

    // '/metrics' endpoint
    await fastify.register(require('fastify-metrics'), {
        endpoint: '/metrics'
    });

    // add '/logs' route
    await fastify.route({
        method: 'GET',
        url: '/logs',
        schema: {
                description: 'Retrieves log lines. Note: the client shall handle premature chunk stream end in response body triggered by server side error condition after chunk stream started.',
                querystring: {
                type: 'object',
                properties: { // optional
                    filename: {type: 'string', description: 'Name of the log file (optional)'},
                    lines: {type: 'integer', description: 'Number of last lines to retrieve (optional)'},
                    keyword: {type: 'string', description: 'Keyword to filter log lines (optional)'},
                },
                required: [], // no required
            },
            response: {
                200: {
                    type: 'string', // response will be a plain text
                    description: 'Log lines: <filename_1>\n<line_1>\n..<line_N>\n\n<file_name2>\n<line_1>..'
                }
            }
        },
        handler: logs_request_handler
    });
}

async function logs_request_handler(request, reply) {
    let filename_regex;
    if (request.params.filename === undefined) {
        filename_regex = process.env.LF_INCLUDE_REGEX;
    } else {
        filename_regex = '^' + escapeRegexp(request.params.filename) + '$';
    }
    const num_lines = request.params.lines;
    const keyword = request.params.keyword;
    const log_dir = process.env.LF_LOG_DIR
    try {
        return await logs_handler(log_dir, RegExp(filename_regex), num_lines, keyword, (text) => {
            reply.send(text)
        });
    } catch (err) {
        reply.log.error(err);
        if (reply.sent) {
            reply.raw.end();  // premature chunk stream end indication to client
        } else {
            reply.code(500).send('Error in logs_handler');
        }
    }
}


module.exports = {
    configureRoutes
};

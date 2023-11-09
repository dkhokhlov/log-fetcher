const {logs_handler} = require('./logs_handler')

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
                description: 'Retrieves log lines. Order of outputted log lines: latest log lines listed first. ' +
                    'If keyword is defined then only matching lines are returned. Lines are sent as-is w/o decoding/encoding. ' +
                    ' Note: the client is responsible for correct handling of premature end of chunk stream to detect error condition' +
                    ' when server side error happened after sending of lines started.',
                querystring: {
                type: 'object',
                properties: { // optional
                    filename: {type: 'string', description: 'Name of the log file (optional)'},
                    lines: {type: 'integer', description: 'Number of last lines to retrieve (optional)'},
                    keyword: {type: 'string', description: 'Keyword to filter log lines (optional)'},
                },
                required: ['filename']
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
    reply.type('text/plain'); // just in case, we send log lines as Buffer w/o decoding/encoding
    const log_dir = process.env.LF_LOG_DIR
    const file_name = request.params.filename;
    const num_lines = request.params.lines;
    const keyword = request.params.keyword;
    const chunk_size = parseInt(process.env.LF_CHUNK_SIZE, 10);
    try {
        return await logs_handler(log_dir, file_name, chunk_size, num_lines, keyword, (text) => {
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

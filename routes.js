'use strict'
const path = require('path');
const http = require('http');
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
            description: 'Retrieves log lines from given file. Order of outputted log lines: latest log lines listed first. ' +
                'If keyword is defined then only matching lines are returned. Lines are sent using UTF-8 encoding. ' +
                'Note: the client is responsible for correct handling of premature end-of-chunk-stream to detect ' +
                'server side error condition after the sending of lines is started.',
            querystring: {
                type: 'object',
                properties: {
                    filename: {type: 'string', description: 'Name of the log file'},
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

    fastify.route({
        method: 'GET',
        url: '/logs-from-servers',
        schema: {
            description: 'Retrieves log lines from given file on multiple servers. Order of outputted log lines: latest log lines listed first. ' +
                'If keyword is defined then only matching lines are returned. Lines are sent using UTF-8 encoding. ' +
                'Note: the client is responsible for correct handling of premature end-of-chunk-stream to detect ' +
                'server side error condition after the sending of lines is started.',
            querystring: {
                type: 'object',
                properties: {
                    urls: {
                        type: 'array',
                        items: {type: 'string'},
                        minItems: 1,
                        description: 'List of unique urls. each url follows the format of "/logs" endpoint'
                    },
                },
                required: ['urls']
            }
        },
        handler: multi_server_logs_request_handler
    });
}

async function logs_request_handler(request, reply) {
    reply.type('text/plain; charset=utf-8'); // just in case
    const log_dir = process.env.LF_LOG_DIR
    const file_name = request.query.filename;
    const file_path = path.join(log_dir, file_name);
    const file_encoding = process.env.LF_FILE_ENCODING
    const num_lines = request.query.lines;
    const keyword = request.query.keyword;
    const chunk_size = parseInt(process.env.LF_CHUNK_SIZE, 10);
    try {
        reply.raw.writeHead(200, {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache',
            'Transfer-Encoding': 'chunked'
        });
        await logs_handler(file_path, file_encoding, chunk_size, num_lines, keyword, async (chunk) => {
            let chunk_clone = Buffer.from(chunk);
            let done = reply.raw.write(chunk_clone);
            while (!done) { // handle backpressure
                await new Promise(resolve => reply.raw.once('drain', resolve));
                done = reply.raw.write(chunk_clone); // retry writing the chunk
            }
        })
        reply.raw.end(); // end the response
    } catch (err) {
        reply.log.error(err);
        if (reply.sent) {
            reply.raw.end();  // premature chunk stream end to tell client there was a server error during streaming
        } else {
            reply.code(500).send('Error in logs_handler');
        }
    }
}

async function multi_server_logs_request_handler(request, reply) {
    reply.type('text/plain; charset=utf-8');
    reply.raw.writeHead(200, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked'
    });

    let {urls} = request.query;
    if (!Array.isArray(urls)) {
        urls = [urls];
    }
    urls = Array.from(new Set(urls));

    async function write_chunk(chunk) {
        let done = reply.raw.write(chunk);
        while (!done) { // handle backpressure
            await new Promise(resolve => reply.raw.once('drain', resolve));
            done = reply.raw.write(chunk); // retry writing the chunk
        }
    }

    const processUrl = (url) => {
        return new Promise((resolve, reject) => {
            http.get(url, (response) => {
                response.on('data', async (chunk) => {
                    const framed_chunk = `${url}\n${chunk.toString()}\0`;
                    await write_chunk(framed_chunk);
                });
                response.on('end', () => {
                    resolve();
                });
                response.on('error', (err) => {
                    let msg = `${url}\nError: ${err.message}\n\0`;
                    reply.log.error(msg);
                    write_chunk(msg);
                    reject(err);
                });
            }).on('error', (err) => {
                let msg = `${url}\nError: ${err.message}\n\0`;
                reply.log.error(msg);
                write_chunk(msg);
                reject(err);
            });
        });
    };

    try {
        await Promise.all(urls.map(url => processUrl(url)));
    } catch (error) {
        request.log.error(error);
        reply.code(500).send('An error occurred while processing the URLs');
    } finally {
        reply.raw.end(); // End the response stream
    }
}


module.exports = {
    configureRoutes
};

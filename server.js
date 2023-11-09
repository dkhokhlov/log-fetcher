'use strict'

const dotenv = require('dotenv');
const result = dotenv.config();

var pjson = require('./package.json');
console.log(`log_fetcher v${pjson.version} ${pjson.description}`);

const fastify = require('fastify')
const swagger = require('@fastify/swagger');
const fastifyMetrics = require('fastify-metrics');

const server = fastify({ logger: true, redact: ["headers.authorization"]});

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
      properties: {
        level: { type: 'string' }, // Optional parameter
        date: { type: 'string', format: 'date' } // Optional parameter with date format
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
    const { level, date } = request.query;
    let logLine = 'INFO: A log line from the Fastify server.';
    reply.type('text/plain');
    return logLine;
  }
});


// start the server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.LF_PORT });
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
    fastify.log.info(`documentation at ${fastify.server.address().port}/doc`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

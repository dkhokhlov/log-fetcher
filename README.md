# log-fetcher

**log-fetcher** is a web service that provides on-demand logs monitoring of various servers, removing the necessity to
individually log into each machine and access log files in specific directories.

<!-- TOC -->
* [log-fetcher](#log-fetcher)
  * [Features](#features)
  * [Installation](#installation)
    * [Prerequisites](#prerequisites)
    * [Steps](#steps)
    * [Configuration](#configuration)
  * [Usage](#usage)
    * [Start server](#start-server)
    * [Using curl](#using-curl)
      * [fetch whole log file](#fetch-whole-log-file)
      * [fetch last 10 lines from log file](#fetch-last-10-lines-from-log-file)
      * [fetch last 10 lines from log file that include keyword 'error'](#fetch-last-10-lines-from-log-file-that-include-keyword--error)
  * [Tests](#tests)
<!-- TOC -->

## Features

- REST request to a machine in order to retrieve logs from files in the configurable directory on the machine receiving
  the REST request.
- REST request to one “primary” server which subsequently requests those logs from a list of “secondary” servers.
- The returned log lines are presented with the newest log lines first.
- [REST API documentation](doc/REST-API.md)
- Metrics endpoint: **/metrics**
- Swagger endpoint: **/doc**
- The web server is built using Fastify.
- Platforms: Linux, Windows, macOS.
- Node.js version: '16.20.2'

## Installation

### Prerequisites

- **nvm** - can be installed [from here](https://github.com/nvm-sh/nvm#install--update-script)

### Steps

```
git clone https://github.com/dkhokhlov/log-fetcher.git
cd log-fetcher
nvm install 16
nvm use
npm install
```

### Configuration

Configuration is controlled by environment variables that are stored in .env file in repo root whihc overrides env vars.

| name               | value in .env  file | description                                                                                      |
|--------------------|---------------------|--------------------------------------------------------------------------------------------------|
| LF_PORT            | 5333                | web server port                                                                                  |
| LF_LOG_DIR         | .                   | logs directory                                                                                   |
| LF_CHUNK_SIZE      | 10000               | http response chunk size                                                                         |
| LF_FILE_ENCODING   | utf8                | log files encoding.<br/>For **Linux & macOS** use **utf8**.<br/>For **Windows** use **utf16le**. |
| LF_THREADPOOL_SIZE | 8                   | libuv threadpool size, used for blocking file io.                                                |
| LF_LOG_LEVEL       | info                | log level                                                                                        |

## Usage

### Start server

```
node server.js
```

### Using curl

#### fetch whole log file

```angular2html
curl http://127.0.0.1:5333/logs?filename=large_log_file.log > log
```

#### fetch last 10 lines from log file

```angular2html
curl http://127.0.0.1:5333/logs?lines=10&filename=large_log_file.log > log
```

#### fetch last 10 lines from log file that include keyword 'error'

```angular2html
curl http://127.0.0.1:5333/logs?keyword=error&lines=10&filename=large_log_file.log > log
```

## Tests

Takes time because of test with randomization of parameters (seeded).

```angular2html
npm run test
npm run lint
```

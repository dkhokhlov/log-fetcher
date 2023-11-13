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
  the REST request. Served by **/log** endpoint.
- REST request to one “primary” server which subsequently requests those logs from a list of “secondary” servers running **log-fetcher**. Served by **/logs-from-servers** endpoint.
- The returned log lines are presented with the newest log lines first.
- Metrics endpoint: **/metrics**
- Swagger endpoint: **/doc**
- Built using Fastify. HTTP only.
- Platforms: Linux, Windows, macOS.
- Node.js version: 16.20

## Design notes
- **/logs** endpoint
  - Returns log lines from log file in LF_LOG_DIR directory. File name is speified in **filename** query parameter  
  - 'Content-Type': 'text/plain; charset=utf-8'
  - 'Transfer-Encoding': 'chunked'
    - Note: the client is responsible for correct handling of premature end-of-chunk-stream to detect server side error condition after the sending of lines is started.
  - Order of outputted log lines - latest log lines listed first.
  - If "keyword" query parameter is defined then only matching lines are returned.
  - Number of return lines can be specified in optional "lines" query parameter.
  - core functionality is in functions [logs_handler](https://github.com/dkhokhlov/log-fetcher/blob/master/logs_handler.js#L9) and [backwardLineSegmentation](https://github.com/dkhokhlov/log-fetcher/blob/master/utils.js#L66).

- **/logs-from-servers** endpoint
  - Sends REST requests listed in **urls** query parameter to secondary servers running **log-fetcher** and multiplex returned chunked responses in reply.
  - reply chunks format:  <url>\n<chunk>\0
  - Urls listed in **urls* follow the same format as full url of **/logs** endpoint
  - core functionality is in function [multi_server_logs_request_handler](https://github.com/dkhokhlov/log-fetcher/blob/master/routes.js#L119)

- [REST API documentation ](doc/REST-API.md)generated from Swagger **/doc** endpoint (http://localhost:5333/doc).

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

Configuration is controlled by environment variables stored in **.env** file in repo root. Shell environment variables override **.env**.

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

## To-Do
  - https support
  - reply compression (gzip)

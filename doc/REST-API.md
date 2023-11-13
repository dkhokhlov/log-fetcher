---
title: "@fastify/swagger v8.12.0"
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
highlight_theme: darkula
headingLevel: 2

---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="-fastify-swagger">@fastify/swagger v8.12.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

<h1 id="-fastify-swagger-default">Default</h1>


## get__logs

> Code samples

```shell
# You can also use wget
curl -X GET /logs?filename=string \
  -H 'Accept: */*'

```

```http
GET /logs?filename=string HTTP/1.1

Accept: */*

```

```javascript

const headers = {
  'Accept':'*/*'
};

fetch('/logs?filename=string',
{
  method: 'GET',

  headers: headers
})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

headers = {
  'Accept' => '*/*'
}

result = RestClient.get '/logs',
  params: {
  'filename' => 'string'
}, headers: headers

p JSON.parse(result)

```

```python
import requests
headers = {
  'Accept': '*/*'
}

r = requests.get('/logs', params={
  'filename': 'string'
}, headers = headers)

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$headers = array(
    'Accept' => '*/*',
);

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/logs', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/logs?filename=string");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    headers := map[string][]string{
        "Accept": []string{"*/*"},
    }

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/logs", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /logs`

Retrieves log lines from given file. Order of outputted log lines: latest log lines listed first. If keyword is defined then only matching lines are returned. Lines are sent using UTF-8 encoding. Note: the client is responsible for correct handling of premature end-of-chunk-stream to detect server side error condition after the sending of lines is started.

<h3 id="get__logs-parameters">Parameters</h3>

| Name     | In    | Type    | Required | Description                                 |
|----------|-------|---------|----------|---------------------------------------------|
| filename | query | string  | true     | Name of the log file                        |
| lines    | query | integer | false    | Number of last lines to retrieve (optional) |
| keyword  | query | string  | false    | Keyword to filter log lines (optional)      |

> Example responses

> 200 Response

<h3 id="get__logs-responses">Responses</h3>

| Status | Meaning                                                 | Description             | Schema |
|--------|---------------------------------------------------------|-------------------------|--------|
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | Log lines: <filename_1> |        |

<line_1>
..<line_N>

<file_name2>
<line_1>..|string|

<aside class="success">
This operation does not require authentication
</aside>

## get__logs-from-servers

> Code samples

```shell
# You can also use wget
curl -X GET /logs-from-servers?urls=string

```

```http
GET /logs-from-servers?urls=string HTTP/1.1

```

```javascript

fetch('/logs-from-servers?urls=string',
{
  method: 'GET'

})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

result = RestClient.get '/logs-from-servers',
  params: {
  'urls' => 'array[string]'
}

p JSON.parse(result)

```

```python
import requests

r = requests.get('/logs-from-servers', params={
  'urls': [
  "string"
]
})

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/logs-from-servers', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/logs-from-servers?urls=string");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/logs-from-servers", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /logs-from-servers`

Retrieves log lines from given file on multiple servers. Order of outputted log lines: latest log lines listed first. If keyword is defined then only matching lines are returned. Lines are sent using UTF-8 encoding. Note: the client is responsible for correct handling of premature end-of-chunk-stream to detect server side error condition after the sending of lines is started.

<h3 id="get__logs-from-servers-parameters">Parameters</h3>

| Name | In    | Type          | Required | Description                                                          |
|------|-------|---------------|----------|----------------------------------------------------------------------|
| urls | query | array[string] | true     | List of unique urls. each url follows the format of "/logs" endpoint |

<h3 id="get__logs-from-servers-responses">Responses</h3>

| Status | Meaning                                                 | Description      | Schema |
|--------|---------------------------------------------------------|------------------|--------|
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | Default Response | None   |

<aside class="success">
This operation does not require authentication
</aside>

## get__metrics

> Code samples

```shell
# You can also use wget
curl -X GET /metrics

```

```http
GET /metrics HTTP/1.1

```

```javascript

fetch('/metrics',
{
  method: 'GET'

})
.then(function(res) {
    return res.json();
}).then(function(body) {
    console.log(body);
});

```

```ruby
require 'rest-client'
require 'json'

result = RestClient.get '/metrics',
  params: {
  }

p JSON.parse(result)

```

```python
import requests

r = requests.get('/metrics')

print(r.json())

```

```php
<?php

require 'vendor/autoload.php';

$client = new \GuzzleHttp\Client();

// Define array of request body.
$request_body = array();

try {
    $response = $client->request('GET','/metrics', array(
        'headers' => $headers,
        'json' => $request_body,
       )
    );
    print_r($response->getBody()->getContents());
 }
 catch (\GuzzleHttp\Exception\BadResponseException $e) {
    // handle exception or api errors.
    print_r($e->getMessage());
 }

 // ...

```

```java
URL obj = new URL("/metrics");
HttpURLConnection con = (HttpURLConnection) obj.openConnection();
con.setRequestMethod("GET");
int responseCode = con.getResponseCode();
BufferedReader in = new BufferedReader(
    new InputStreamReader(con.getInputStream()));
String inputLine;
StringBuffer response = new StringBuffer();
while ((inputLine = in.readLine()) != null) {
    response.append(inputLine);
}
in.close();
System.out.println(response.toString());

```

```go
package main

import (
       "bytes"
       "net/http"
)

func main() {

    data := bytes.NewBuffer([]byte{jsonReq})
    req, err := http.NewRequest("GET", "/metrics", data)
    req.Header = headers

    client := &http.Client{}
    resp, err := client.Do(req)
    // ...
}

```

`GET /metrics`

<h3 id="get__metrics-responses">Responses</h3>

| Status | Meaning                                                 | Description      | Schema |
|--------|---------------------------------------------------------|------------------|--------|
| 200    | [OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) | Default Response | None   |

<aside class="success">
This operation does not require authentication
</aside>





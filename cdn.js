function syncFetch (...args) {
    const request = new syncFetch.Request(...args)

    const xhr = new XMLHttpRequest()
    xhr.withCredentials = request.credentials === 'include'
    xhr.timeout = request[INTERNALS].timeout

    // Request
    xhr.open(request.method, request.url, false)

    try {
        xhr.responseType = 'arraybuffer'
    } catch (e) {
        // not in Worker scope
        // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType#Synchronous_XHR_restrictions
    }

    for (const header of request.headers) {
        xhr.setRequestHeader(...header)
    }

    xhr.send(request.body || null)

    // Response
    let headers = xhr.getAllResponseHeaders()
    headers = headers && headers.split('\r\n').filter(Boolean).map(header => header.split(': ', 2))

    const response = new syncFetch.Response(xhr.response, {
        headers,
        status: xhr.status,
        statusText: xhr.statusText
    })

    response[INTERNALS].url = xhr.responseURL
    response[INTERNALS].redirected = xhr.responseURL !== request.url

    return response
}

const INTERNALS = Symbol('SyncFetch Internals')
const REQ_UNSUPPORTED = ['mode', 'cache', 'redirect', 'referrer', 'integrity']
const HTTP_STATUS = {
    100: 'Continue',
    101: 'Switching Protocols',
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    307: 'Temporary Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Failed',
    413: 'Payload Too Large',
    414: 'URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Range Not Satisfiable',
    417: 'Expectation Failed',
    426: 'Upgrade Required',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported'
}

class SyncRequest {
    constructor (resource, init = {}) {
        for (const option of REQ_UNSUPPORTED) {
            if (option in init) {
                throw new TypeError(`option ${option} not supported`)
            }
        }

        if (init.credentials === 'same-origin') {
            throw new TypeError('option credentials with value \'same-origin\' not supported')
        }

        this[INTERNALS] = {
            method: init.method || 'GET',
            headers: new syncFetch.Headers(init.headers),
            body: init.body /* ? Buffer.from(init.body) : null */,
            credentials: init.credentials || 'omit',

            // Non-spec
            timeout: init.timeout || 0
        }

        if (typeof resource === 'string') {
            this[INTERNALS].url = resource
        } else if (resource instanceof SyncRequest) {
            this[INTERNALS].url = resource.url
            if (!init.method) {
                this[INTERNALS].method = resource.method
            }
            if (!init.headers) {
                this[INTERNALS].headers = resource.headers
            }
            if (!init.body) {
                this[INTERNALS].body = resource[INTERNALS].body
            }
            if (!init.credentials) {
                this[INTERNALS].credentials = resource.credentials
            }
        } else {
            throw new TypeError('Request input should be a URL string or a Request object')
        }
    }

    get cache () {
        return 'default'
    }

    get credentials () {
        return this[INTERNALS].credentials
    }

    get destination () {
        return ''
    }

    get headers () {
        return this[INTERNALS].headers
    }

    get integrity () {
        return ''
    }

    get method () {
        return this[INTERNALS].method
    }

    get mode () {
        return 'cors'
    }

    get priority () {
        return 'auto'
    }

    get redirect () {
        return 'follow'
    }

    get referrer () {
        return 'about:client'
    }

    get referrerPolicy () {
        return ''
    }

    get url () {
        return this[INTERNALS].url
    }

    clone () {
        checkBody(this)
        return new SyncRequest(this.url, this[INTERNALS])
    }
}

class SyncResponse {
    constructor (body, init = {}) {
        this[INTERNALS] = {
            body: body /* ? Buffer.from(body) : null */,
            bodyUsed: false,

            headers: new syncFetch.Headers(init.headers),
            status: init.status,
            statusText: init.statusText
        }
    }

    get headers () {
        return this[INTERNALS].headers
    }

    get ok () {
        const status = this[INTERNALS].status
        return status >= 200 && status < 300
    }

    get redirected () {
        return this[INTERNALS].redirected
    }

    get status () {
        return this[INTERNALS].status
    }

    get statusText () {
        return this[INTERNALS].statusText
    }

    get url () {
        return this[INTERNALS].url
    }

    clone () {
        return this.redirect(this[INTERNALS].url, this[INTERNALS].status)
    }

    redirect (url, status) {
        checkBody(this)

        const response = new SyncResponse(this[INTERNALS].body, {
            headers: this[INTERNALS].headers,
            status: status || this[INTERNALS].status,
            statusText: HTTP_STATUS[status] || this[INTERNALS].statusText
        })

        response[INTERNALS].url = url || this[INTERNALS].url
        response[INTERNALS].redirected = this[INTERNALS].redirected

        return response
    }
}

class Body {
    constructor (body) {
        this[INTERNALS] = {
            body /* : Buffer.from(body) */,
            bodyUsed: false
        }
    }

    get bodyUsed () {
        return this[INTERNALS].bodyUsed
    }

    static mixin (prototype) {
        for (const name of Object.getOwnPropertyNames(Body.prototype)) {
            if (name === 'constructor') { continue }
            const desc = Object.getOwnPropertyDescriptor(Body.prototype, name)
            Object.defineProperty(prototype, name, { ...desc, enumerable: true })
        }
    }

    arrayBuffer () {
        const buffer = consumeBody(this)
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    }

    blob () {
        const type = this.headers && this.headers.get('content-type')
        return new Blob([consumeBody(this)], type && { type })
    }

    text () {
        return consumeBody(this).toString()
    }

    json () {
        try {
            return JSON.parse(consumeBody(this).toString())
        } catch (err) {
            throw new TypeError(`invalid json response body at ${this.url} reason: ${err.message}`, 'invalid-json')
        }
    }

    buffer () {
        return consumeBody(this).clone()
    }
}

function checkBody (body) {
    if (body.bodyUsed) {
        throw new TypeError(`body used already for: ${body.url}`)
    }
}

function consumeBody (body) {
    checkBody(body)
    body[INTERNALS].bodyUsed = true
    return body[INTERNALS].body /* || Buffer.alloc(0) */
}

Body.mixin(SyncRequest.prototype)
Body.mixin(SyncResponse.prototype)

class SyncFetchHeaders {
    constructor (headers) {
        if (headers instanceof syncFetch.Headers) {
            this[INTERNALS] = { ...headers[INTERNALS] }
        } else {
            this[INTERNALS] = {}

            if (Array.isArray(headers)) {
                for (const [name, value] of headers) {
                    this.append(name, value)
                }
            } else if (typeof headers === 'object') {
                for (const name in headers) {
                    this.set(name, headers[name])
                }
            }
        }
    }

    // modification
    append (name, value) {
        name = name.toLowerCase()
        if (!this[INTERNALS][name]) {
            this[INTERNALS][name] = []
        }
        this[INTERNALS][name].push(value)
    }

    delete (name) {
        delete this[INTERNALS][name.toLowerCase()]
    }

    set (name, value) {
        this[INTERNALS][name.toLowerCase()] = [value]
    }

    // access
    entries () {
        const pairs = []
        for (const name in this[INTERNALS]) {
            for (const value of this[INTERNALS][name]) {
                pairs.push([name, value])
            }
        }
        return pairs
    }

    get (name) {
        name = name.toLowerCase()
        return name in this[INTERNALS] ? this[INTERNALS][name].join(', ') : null
    }

    keys () {
        return Object.keys(this[INTERNALS])
    }

    has (name) {
        return name.toLowerCase() in this[INTERNALS]
    }

    values () {
        const values = []
        for (const name in this[INTERNALS]) {
            for (const value of this[INTERNALS][name]) {
                values.push(value)
            }
        }
        return values
    }

    * [Symbol.iterator] () {
        for (const name in this[INTERNALS]) {
            for (const value of this[INTERNALS][name]) {
                yield [name, value]
            }
        }
    }
}

syncFetch.Headers = SyncFetchHeaders
syncFetch.Request = SyncRequest
syncFetch.Response = SyncResponse

let fetchSync = syncFetch;

JSON.safeStringify = (obj, indent = 2) => {
    let cache = [];
    const retVal = JSON.stringify(
        obj,
        (key, value) =>
            typeof value === "object" && value !== null
                ? cache.includes(value)
                    ? undefined
                    : cache.push(value) && value
                : value,
        indent
    );
    cache = null;
    return retVal;
};

let SRequestParsers = {
    query(query) {
        let str = "";
        Object.keys(query).forEach((key, index) => {
            str += `${index === 0 ? '?' : '&'}${key}=${query[key]}`;
        });
        return str;
    },
    params(url, params) {
        if (params === undefined || params === null || typeof params !== "object") return url;
        Object.keys(params).forEach(key => {
            url = url.replace(':' + key, params[key]);
        });
        return url;
    },
    headers(headers) {
        let obj = {};
        headers.forEach((value, key) => {
            obj[key] = value;
            try {
                obj[key] = JSON.parse(obj[key]);
            }
            catch (error) {
                let num = Number(obj[key]);
                if (!isNaN(num)) {
                    obj[key] = num;
                }
            }
        })
        return obj;
    },
    syncHeaders(headers) {
        let obj = {};
        headers.keys().forEach(key => {
            obj[key] = headers.get(key);
            try {
                obj[key] = JSON.parse(obj[key]);
            }
            catch (error) {
                let num = Number(obj[key]);
                if (!isNaN(num)) {
                    obj[key] = num;
                }
            }
        })
        return obj;
    }
};

let defaultOptions = {
    query: {},
    headers: {},
    params: {},
    body: undefined
};

async function SRequestRaw(url, method = "get", options = defaultOptions) {
    let {query, params, body, ...Options} = options;

    if (body !== undefined && typeof body === "object" && !(body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer)) {
        body = JSON.safeStringify(body);
    }

    let Url = SRequestParsers.params(url, params) + (query !== undefined ? SRequestParsers.query(query) : "");

    return fetch(Url, {
        method,
        body,
        ...Options
    });
}

function SRequestSyncRaw(url, method = "get", options = defaultOptions) {
    let {query, params, body, ...Options} = options;

    if (body !== undefined && typeof body === "object" && !(body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer)) {
        body = JSON.safeStringify(body);
    }

    let Url = SRequestParsers.params(url, params) + (query !== undefined ? SRequestParsers.query(query) : "");

    return fetchSync(Url, {
        method,
        body,
        ...Options
    });
}

async function SRequest(url, method = "get", options = defaultOptions) {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await SRequestRaw(url, method, options).catch(reject);

            let responseBody;
            for (let func of [response.formData, response.json, response.text]) {
                try {
                    responseBody = await func.bind(response)();
                    break;
                }
                catch (error) {}
            }

            let num = Number(responseBody);
            if (!isNaN(num)) {
                responseBody  = num;
            }

            resolve({
                url: response.url,
                status: response.status,
                ok: response.ok,
                redirected: response.redirected,
                statusText: response.statusText,
                headers: SRequestParsers.headers(response.headers),
                body: responseBody
            });
        }
        catch (error) {reject(error);}
    });
}

function SRequestSync(url, method = "get", options = defaultOptions, onError = console.error) {
    try {
        let response = SRequestSyncRaw(url, method, options);

        let responseBody = response.text();
        try {
            responseBody = JSON.parse(responseBody);
        }
        catch (error) {
            try {
                let num = Number(responseBody);
                if (!isNaN(num)) {
                    responseBody  = num;
                }
            }
            catch (error) {}
        }

        return {
            url: response.url,
            status: response.status,
            ok: response.ok,
            redirected: response.redirected,
            statusText: response.statusText,
            headers: SRequestParsers.syncHeaders(response.headers),
            body: responseBody
        };
    }
    catch (error) {onError(error)}
}

async function SPost(url, body, options = defaultOptions) {
    return SRequest(url, "Post", {body, ...options});
}

async function SGet(url, options = defaultOptions) {
    return SRequest(url, "Get", options);
}

async function SPut(url, options = defaultOptions) {
    return SRequest(url, "Put", options);
}

async function SHead(url, options = defaultOptions) {
    return SRequest(url, "Head", options);
}

async function SDelete(url, options = defaultOptions) {
    return SRequest(url, "Delete", options);
}

async function SOptions(url, options = defaultOptions) {
    return SRequest(url, "Options", options);
}

async function SConnect(url, options = defaultOptions) {
    return SRequest(url, "Connect", options);
}

async function SPatch(url, options = defaultOptions) {
    return SRequest(url, "Patch", options);
}

function SPostSync(url, body, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Post", {...options, body}, onError);
}

function SGetSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Get", options, onError);
}

function SPutSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Put", options, onError);
}

function SHeadSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Head", options, onError);
}

function SDeleteSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Delete", options, onError);
}

function SOptionsSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Options", options, onError);
}

function SConnectSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Connect", options, onError);
}

function SPatchSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Patch", options, onError);
}

let defaultWSOptions = {
    query: {},
    params: {}
}

class SWebsocket {
    ws;
    url;
    openHandlers = [];
    closeHandlers = [];
    errorHandlers = [];
    messageHandlers = [];

    constructor(url) {
        this.url = url;
        this.ws = new WebSocket(url);
        this.ws.onopen = event => this.openHandlers.forEach(func => func.apply(this, [event]));
        this.ws.onclose = event => this.closeHandlers.forEach(func => func.apply(this, [event]));
        this.ws.onerror = event => this.errorHandlers.forEach(func => func.apply(this, [event]));
        this.ws.onmessage = event => this.messageHandlers.forEach(func => func.apply(this, [event]));
        this.close = this.ws.close.bind(this.ws);
        this.send = this.ws.send.bind(this.ws);
    }

    onOpen(callback) {
        this.openHandlers.push(callback);
    }

    onClose(callback) {
        this.closeHandlers.push(callback);
    }

    onError(callback) {
        this.errorHandlers.push(callback);
    }

    onMessage(callback) {
        this.messageHandlers.push(event => {
            let data = event.data;
            try {
                data = JSON.parse(data);
            }
            catch (error) {
                try {
                    let num = Number(data);
                    if (!isNaN(num)) {
                        data = num;
                    }
                }
                catch (error) {}
            }
            callback(data, event);
        });
    }

    close;
    send;

    sendObject(data) {
        this.send(JSON.safeStringify(data));
    }
}

async function SWebSocket(url, {params, query} = defaultWSOptions) {
    url = SRequestParsers.params(url, params) + (query !== undefined ? SRequestParsers.query(query) : "");
    return new Promise((resolve, reject) => {
        let connection = new SWebsocket(url);
        connection.onOpen(event => resolve(connection));
        connection.onError(event => reject(event));
    });
}
import fetchSync from "sync-fetch";
import fetch from "node-fetch";
import SRequestParsers from "./parse.js";
import {WebSocket} from "ws";
import {GqlOptionsType} from "./@types/index.js";

let defaultOptions = {
    query: {},
    headers: {},
    params: {},
    body: undefined
};

export async function SRequestRaw(url, method = "get", options = defaultOptions) {
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

export function SRequestSyncRaw(url, method = "get", options = defaultOptions) {
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

export async function SRequest(url, method = "get", options = defaultOptions) {
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
                responseBody = num;
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

export function SRequestSync(url, method = "get", options = defaultOptions, onError = console.error) {
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
            headers: SRequestParsers.headers(response.headers),
            body: responseBody
        };
    }
    catch (error) {onError(error)}
}

export async function SPost(url, body, options = defaultOptions) {
    return SRequest(url, "Post", {body, ...options});
}

export async function SGet(url, options = defaultOptions) {
    return SRequest(url, "Get", options);
}

export async function SPut(url, options = defaultOptions) {
    return SRequest(url, "Put", options);
}

export async function SHead(url, options = defaultOptions) {
    return SRequest(url, "Head", options);
}

export async function SDelete(url, options = defaultOptions) {
    return SRequest(url, "Delete", options);
}

export async function SOptions(url, options = defaultOptions) {
    return SRequest(url, "Options", options);
}

export async function SConnect(url, options = defaultOptions) {
    return SRequest(url, "Connect", options);
}

export async function SPatch(url, options = defaultOptions) {
    return SRequest(url, "Patch", options);
}

export function SPostSync(url, body, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Post", {...options, body}, onError);
}

export function SGetSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Get", options, onError);
}

export function SPutSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Put", options, onError);
}

export function SHeadSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Head", options, onError);
}

export function SDeleteSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Delete", options, onError);
}

export function SOptionsSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Options", options, onError);
}

export function SConnectSync(url, options = defaultOptions, onError = console.error) {
    return SRequestSync(url, "Connect", options, onError);
}

export function SPatchSync(url, options = defaultOptions, onError = console.error) {
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

export async function SWebSocket(url, {params, query} = defaultWSOptions) {
    url = SRequestParsers.params(url, params) + (query !== undefined ? SRequestParsers.query(query) : "");
    return new Promise((resolve, reject) => {
        let connection = new SWebsocket(url);
        connection.onOpen(event => resolve(connection));
        connection.onError(event => reject(event));
    });
}

let defaultGqlOptions = {
    params: {},
    query: {}
}

class SGraphqlSubSubscription {
    messageHandlers = [];
    parent

    constructor(parent) {
        this.parent = parent;
    }

    onMessage(callback) {
        this.messageHandlers.push(callback);
    }

    emit(data) {
        this.messageHandlers.forEach(func => func.apply(this, [data]));
    }
}

export class SGraphqlSubscription {
    subSubscriptions = {};
    openHandlers = [];
    connection;
    url;

    constructor(url, {params, query} = defaultGqlOptions) {
        this.url = SRequestParsers.params(url, params) + (query !== undefined ? SRequestParsers.query(query) : "");
        SWebSocket(this.url).then(connection => {
            connection.onMessage(data => {
                switch (data.type) {
                    case "connection_ack":
                        this.openHandlers.forEach(func => func.apply(this));
                        break;
                    case "next":
                        this.subSubscriptions[data.id].emit(data.payload);
                        break;
                }
            });
            connection.sendObject({type: "connection_init"});
            this.connection = connection;
        });
    }

    createId() {
        let id;
        do {
            id = String(Date.now() % 1000000000);
        } while (Object.keys(this.subSubscriptions).includes(id));
        return id;
    }

    subscribe(query, options) {
        let id = this.createId();
        this.connection.sendObject({
            payload: {...options, query},
            type: "subscribe",
            id
        });
        this.subSubscriptions[id] = new SGraphqlSubSubscription(this);
        return this.subSubscriptions[id];
    }

    onOpen(callback) {
        this.openHandlers.push(callback);
    }

    onClose(callback) {
        this.connection.onClose(callback);
    }

    onError(callback) {
        this.connection.onError(callback);
    }
}

export async function SGraphql(url, query, {params, query: queryParams, ...options} = defaultGqlOptions) {
    if (url.startsWith("ws")) {
        return new Promise((resolve, reject) => {
            let connection = new SGraphqlSubscription(url);
            connection.onOpen(() => {
                connection.onError(resolve);
                resolve(connection.subscribe(query, options));
            });
        });
    }
    url = SRequestParsers.params(url, params) + (queryParams !== undefined ? SRequestParsers.query(queryParams) : "");
    return SPost(url, {...options, query});
}

export async function SGraphqlQM(url, query, options) {
    if (url.startsWith("ws")) return 0;
    return SGraphql(url, query, options);
}

export async function SGraphqlS(url, query, options) {
    if (url.startsWith("http")) return 0;
    return SGraphql(url, query, options);
}

export function SGraphqlSync(url, query, {params, query: queryParams, ...options} = defaultGqlOptions) {
    url = SRequestParsers.params(url, params) + (queryParams !== undefined ? SRequestParsers.query(queryParams) : "");
    return SPostSync(url, {...options, query});
}
import {Response} from "node-fetch";
import {Event, CloseEvent, ErrorEvent, MessageEvent, WebSocket} from "ws";

export type OptionsType = {
    query?: {[key: string]: string},
    headers?: {[key: string]: string},
    params?: {[key: string]: string},
    body?: any,
    [key: string]: any
};

export type MethodsType = "post" | "get" | "put" | "head" | "delete" | "options" | "connect" | "patch" | "Post" | "Get"
    | "Put" | "Head" | "Delete" | "Options" | "Connect" | "Patch" | Uppercase<"post" | "get" | "put" | "head" | "delete" | "options" | "connect" | "patch">;

export function SRequestRaw(url: string, method?: MethodsType, options?: OptionsType): Promise<Response>;

export function SRequestSyncRaw(url: string, method?: MethodsType, options?: OptionsType): any;

export type SResponseType = {
    url: string,
    status: number,
    ok: boolean,
    redirected: boolean,
    statusText: string,
    headers: {[key: string]: any},
    body: any
};

export function SRequest(url: string, method?: MethodsType, options?: OptionsType): Promise<SResponseType>;

export type ErrorHandlerType = (error: any) => void;

export function SRequestSync(url: string, method?: MethodsType, options?: OptionsType, onError?: ErrorHandlerType): SResponseType;

export function SPost(url: string, body?: any, options?: OptionsType): Promise<SResponseType>;

export function SGet(url: string, options?: OptionsType): Promise<SResponseType>;

export function SPut(url: string, options?: OptionsType): Promise<SResponseType>;

export function SHead(url: string, options?: OptionsType): Promise<SResponseType>;

export function SDelete(url: string, options?: OptionsType): Promise<SResponseType>;

export function SOptions(url: string, options?: OptionsType): Promise<SResponseType>;

export function SConnect(url: string, options?: OptionsType): Promise<SResponseType>;

export function SPatch(url: string, options?: OptionsType): Promise<SResponseType>;

export function SPostSync(url: string, body?: any, options?: OptionsType, onError?: ErrorHandlerType): SResponseType;

export function SGetSync(url: string, options?: OptionsType, onError?: ErrorHandlerType): SResponseType;

export function SPutSync(url: string, options?: OptionsType, onError?: ErrorHandlerType): SResponseType;

export function SHeadSync(url: string, options?: OptionsType, onError?: ErrorHandlerType): SResponseType;

export function SDeleteSync(url: string, options?: OptionsType, onError?: ErrorHandlerType): SResponseType;

export function SOptionsSync(url: string, options?: OptionsType, onError?: ErrorHandlerType): SResponseType;

export function SConnectSync(url: string, options?: OptionsType, onError?: ErrorHandlerType): SResponseType;

export function SPatchSync(url: string, options?: OptionsType, onError?: ErrorHandlerType): SResponseType;

export type WSOptionsType = {
    query?: {[key: string]: string},
    params?: {[key: string]: string},
    [key: string]: any
};

export type BufferLike =
    | string
    | Buffer
    | DataView
    | number
    | ArrayBufferView
    | Uint8Array
    | ArrayBuffer
    | SharedArrayBuffer
    | readonly any[]
    | readonly number[]
    | { valueOf(): ArrayBuffer }
    | { valueOf(): SharedArrayBuffer }
    | { valueOf(): Uint8Array }
    | { valueOf(): readonly number[] }
    | { valueOf(): string }
    | { [Symbol.toPrimitive](hint: string): string };

declare class SWebsocket {
    ws: WebSocket;
    url: string;
    openHandlers: Array<(this: SWebsocket, event: Event) => void>;
    closeHandlers: Array<(this: SWebsocket, event: CloseEvent) => void>;
    errorHandlers: Array<(this: SWebsocket, event: ErrorEvent) => void>;
    messageHandlers: Array<(this: SWebsocket, data: any, event: MessageEvent) => void>;

    constructor(url: string);

    onOpen(callback: (this: SWebsocket, event: Event) => void): void;

    onClose(callback: (this: SWebsocket, event: CloseEvent) => void): void;

    onError(callback: (this: SWebsocket, event: ErrorEvent) => void): void;

    onMessage(callback: (this: SWebsocket, data: any, event: MessageEvent) => void): void;

    close(code?: number, data?: string | Buffer): void;

    send(data: BufferLike): void;

    sendObject(data: object): void;
}

export function SWebSocket(url: string, options?: WSOptionsType): Promise<SWebsocket>;

export type GqlOptionsType = {
    query?: {[key: string]: string},
    params?: {[key: string]: string},
    [key: string]: any
}

declare class SGraphqlSubSubscription {
    messageHandlers: Array<(this: SGraphqlSubSubscription, data: object) => void>;
    parent: SGraphqlSubscription

    constructor(parent: SGraphqlSubscription);

    onMessage(callback: (this: SGraphqlSubSubscription, data: object) => void): void;

    emit(data: object): void;
}

export class SGraphqlSubscription {
    subSubscriptions: {[key: string]: SGraphqlSubSubscription};
    openHandlers: Array<(this: SGraphqlSubscription) => void>;
    connection: SWebsocket;
    url: string;

    constructor(url: string, options?: {query?: {[key: string]: string}, params?: {[key: string]: string}});

    createId(): string;

    subscribe(query: string, options: Omit<Omit<GqlOptionsType, "query">, "params">): SGraphqlSubSubscription;

    onOpen(callback: (this: SGraphqlSubscription) => void): void;

    onClose(callback: Parameters<typeof SWebsocket.prototype.onClose>[0]): void;

    onError(callback: Parameters<typeof SWebsocket.prototype.onError>[0]): void;
}

export function SGraphql(url: string, query: string, options: GqlOptionsType): Promise<SResponseType | SGraphqlSubSubscription>;

export function SGraphqlQM(url: string, query: string, options: GqlOptionsType): Promise<SResponseType>;

export function SGraphqlS(url: string, query: string, options: GqlOptionsType): Promise<SGraphqlSubSubscription>;

export function SGraphqlSync(url: string, query: string, options: GqlOptionsType): SResponseType;
import {Response} from "node-fetch";
import {Event, CloseEvent, ErrorEvent, MessageEvent, WebSocket} from "ws";

export type OptionsType = {
    query?: {[key: string]: string},
    headers?: {[key: string]: string},
    params?: {[key: string]: string},
    body?: any
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
    params?: {[key: string]: string}
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
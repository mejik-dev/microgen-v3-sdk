import WebSocket, {
  MessageEvent,
  CloseEvent,
  ErrorEvent,
  Event,
} from 'isomorphic-ws';

type EventListener = (
  event: Event | MessageEvent | CloseEvent | ErrorEvent,
) => void;

interface EventListeners {
  [key: string]: EventListener[];
}

export default class ReconnectingWebSocket {
  private url: string;
  private protocols: string | string[] | undefined;
  private ws: WebSocket | null;
  private reconnectTimeout: number;
  private maxReconnectTimeout: number;
  private eventListeners: EventListeners;

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
    this.ws = null;
    this.reconnectTimeout = 1000; // Initial reconnect timeout
    this.maxReconnectTimeout = 30000; // Max reconnect timeout
    this.eventListeners = {
      open: [],
      message: [],
      close: [],
      error: [],
    };
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url, this.protocols);

    this.ws.onopen = (event: Event) => {
      console.log('socket connected');
      this.reconnectTimeout = 1000; // Reset timeout on successful connection
      this.dispatchEvent('open', event);
    };

    this.ws.onmessage = (message: MessageEvent) => {
      this.dispatchEvent('message', message);
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('socket disconnected');
      this.dispatchEvent('close', event);
      this.reconnect();
    };

    this.ws.onerror = (error: ErrorEvent) => {
      console.error('socket error:', error);
      this.dispatchEvent('error', error);
      this.ws?.close();
    };
  }

  private reconnect() {
    setTimeout(() => {
      console.log('reconnecting the socket...');
      this.connect();
      this.reconnectTimeout = Math.min(
        this.reconnectTimeout * 2,
        this.maxReconnectTimeout,
      ); // Exponential backoff
    }, this.reconnectTimeout);
  }

  public addEventListener(eventType: string, listener: EventListener) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].push(listener);
    }
  }

  public removeEventListener(eventType: string, listener: EventListener) {
    if (this.eventListeners[eventType]) {
      const index = this.eventListeners[eventType].indexOf(listener);

      if (index !== -1) {
        this.eventListeners[eventType].splice(index, 1);
      }
    }
  }

  private dispatchEvent(
    eventType: string,
    event: Event | MessageEvent | CloseEvent | ErrorEvent,
  ) {
    if (this.eventListeners[eventType]) {
      this.eventListeners[eventType].forEach((listener) => listener(event));
    }
  }

  public send(
    data: string | ArrayBuffer | SharedArrayBuffer | ArrayBufferView,
  ) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.error('socket is not open, readyState:', this.ws?.readyState);
    }
  }

  public close() {
    this.ws?.close();
  }
}

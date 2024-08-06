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

    this.ws.on('open', (event: Event) => {
      console.log('WebSocket connected');
      this.reconnectTimeout = 1000; // Reset timeout on successful connection
      this.dispatchEvent('open', event);
    });

    this.ws.on('message', (message: MessageEvent) => {
      this.dispatchEvent('message', message);
    });

    this.ws.on('close', (event: CloseEvent) => {
      console.log('WebSocket disconnected');
      this.dispatchEvent('close', event);
      this.reconnect();
    });

    this.ws.on('error', (error: ErrorEvent) => {
      console.error('WebSocket error:', error);
      this.dispatchEvent('error', error);
      this.ws?.close();
    });
  }

  private reconnect() {
    setTimeout(() => {
      console.log('Reconnecting...');
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
      console.error('WebSocket is not open. ReadyState:', this.ws?.readyState);
    }
  }

  public close() {
    this.ws?.close();
  }
}

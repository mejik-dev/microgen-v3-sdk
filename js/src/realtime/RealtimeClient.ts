import WebSocket from 'isomorphic-ws';
import qs from 'qs';

import type {
  ConnectCallback,
  DisconnectCallback,
  RealtimeCallback,
  RealtimeClientOption,
  RealtimeRegolCallback,
  SubscribeOption,
  SubscribeRegolOption,
} from './lib/types';

class FailedHTTPResponse extends Error {
  public status: number;
  public statusText: string;
  public data: any;

  constructor(status: number, statusText: string, data: any = null) {
    super(`${status}: ${statusText}`);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export default class RealtimeClient {
  protected option: RealtimeClientOption;

  subscriptions = new Map<string, WebSocket>();
  regolSubscriptions = new Map<string, WebSocket>();

  constructor(option: RealtimeClientOption) {
    this.option = option;
  }

  private async _checkResponse(response: Response) {
    if (!response.ok) {
      throw new FailedHTTPResponse(
        response.status,
        response.statusText,
        await response.text(),
      );
    }

    return response;
  }

  async getTableId(tableName: string): Promise<string> {
    try {
      const res = await this._checkResponse(
        await fetch(
          `${this.option.url}/channel/${this.option.apiKey}/${tableName}`,
        ),
      );
      const data = (await res.json()) as { name: string };

      return data.name.split(':')[1];
    } catch (error) {
      throw error instanceof FailedHTTPResponse ? error.data : error;
    }
  }

  subscribe<T>(
    tableId: string,
    { event, where, token }: SubscribeOption<T>,
    callback: RealtimeCallback,
    onDisconnect?: DisconnectCallback,
    onConnect?: ConnectCallback,
  ) {
    const lastSubscribe = this.subscriptions.get(tableId);

    if (lastSubscribe) {
      lastSubscribe.close();
    }

    let filter = '';

    if (where) {
      filter = ':' + qs.stringify(where, { encodeValuesOnly: true });
    }

    const channel = `query:${tableId}:${event || '*'}${filter}`;

    const websocket = new WebSocket(
      `${this.option.url.replace('http', 'ws')}/connection/${
        this.option.apiKey
      }/websocket${token ? `?token=${token}` : ''}`,
    );

    websocket.onopen = () => {
      websocket.send(
        JSON.stringify({
          params: { name: 'js' },
          id: 1,
        }),
      );
      websocket.send(
        JSON.stringify({
          method: 1,
          params: { channel },
          id: 2,
        }),
      );
      onConnect?.();
    };

    websocket.onclose = () => {
      onDisconnect?.();
    };

    websocket.onerror = (e) => {
      callback?.({
        event: 'ERROR',
        error: e.error,
      });
    };

    websocket.onmessage = (e) => {
      try {
        const value = JSON.parse(String(e.data));

        if (value?.result?.data?.data?.eventType) {
          callback?.({
            event: value.result.data.data.eventType,
            payload: value.result.data.data.payload,
          });
        }
      } catch (error) {
        // do nothing
      }
    };

    this.subscriptions.set(tableId, websocket);
  }

  unsubscribe(tableId: string) {
    const subscription = this.subscriptions.get(tableId);

    if (subscription) {
      subscription.close();
      this.subscriptions.delete(tableId);
    }
  }

  subscribeRegol(
    deviceId: string,
    { event }: SubscribeRegolOption,
    callback: RealtimeRegolCallback,
    onDisconnect?: DisconnectCallback,
    onConnect?: ConnectCallback,
  ) {
    const lastSubscribe = this.regolSubscriptions.get(deviceId);

    if (lastSubscribe) {
      lastSubscribe.close();
    }

    const channel = `auth:${deviceId}:${event || '*'}`;

    const websocket = new WebSocket(
      `${this.option.url.replace('http', 'ws')}/connection/${
        this.option.apiKey
      }/websocket`,
    );

    websocket.onopen = () => {
      websocket.send(
        JSON.stringify({
          params: { name: 'js' },
          id: 1,
        }),
      );
      websocket.send(
        JSON.stringify({
          method: 1,
          params: { channel },
          id: 2,
        }),
      );
      onConnect?.();
    };

    websocket.onclose = () => {
      onDisconnect?.();
    };

    websocket.onerror = (e) => {
      callback?.({
        event: 'ERROR',
        error: e.error,
      });
    };

    websocket.onmessage = (e) => {
      try {
        const value = JSON.parse(String(e.data));

        if (value?.result?.data?.data?.eventType) {
          callback?.({
            event: value.result.data.data.eventType,
            payload: value.result.data.data.payload,
          });
        }
      } catch (error) {
        // do nothing
      }
    };

    this.regolSubscriptions.set(deviceId, websocket);
  }

  unsubscribeRegol(deviceId: string) {
    const subscription = this.regolSubscriptions.get(deviceId);

    if (subscription) {
      subscription.close();
      this.regolSubscriptions.delete(deviceId);
    }
  }
}

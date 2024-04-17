import WebSocket from 'isomorphic-ws';
import qs from 'qs';

import type {
  ConnectCallback,
  DisconnectCallback,
  RealtimeCallback,
  RealtimeClientOption,
  SubscribeOption,
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

  subcriptions = new Map<string, WebSocket>();

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

  async subscribe<T>(
    name: string,
    { token, event, where }: SubscribeOption<T>,
    callback: RealtimeCallback,
    onDisconnect?: DisconnectCallback,
    onConnect?: ConnectCallback,
  ): Promise<string> {
    try {
      const lastSubscribe = this.subcriptions.get(name);

      if (lastSubscribe) {
        lastSubscribe.close();
      }

      let filter = '';

      if (where) {
        filter = ':' + qs.stringify(where, { encodeValuesOnly: true });
      }

      const res = await this._checkResponse(
        await fetch(`${this.option.url}/channel/${this.option.apiKey}/${name}`),
      );
      const data = (await res.json()) as { name: string };
      const channel = `${data.name}:${event || '*'}${filter}`;

      const key = `${name.toLowerCase().replace(' ', '-')}-${String(
        new Date().getTime(),
      )}`;

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
          key,
          event: 'ERROR',
          error: e.error,
        });
      };

      websocket.onmessage = (e) => {
        try {
          const value = JSON.parse(String(e.data));

          if (value?.result?.data?.data?.eventType) {
            callback?.({
              key,
              event: value.result.data.data.eventType,
              payload: value.result.data.data.payload,
            });
          }
        } catch (error) {
          // do nothing
        }
      };

      this.subcriptions.set(key, websocket);

      return key;
    } catch (error) {
      throw error instanceof FailedHTTPResponse ? error.data : error;
    }
  }

  unsubscribe(key: string): boolean {
    const subscription = this.subcriptions.get(key);

    if (subscription) {
      subscription.close();
      this.subcriptions.delete(key);
    }

    return subscription ? true : false;
  }
}

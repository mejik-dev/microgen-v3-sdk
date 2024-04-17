import qs from 'qs';
import {
  RealtimeClientOption,
  RealtimeCallback,
  SubscribeOption,
  ConnectCallback,
  DisconnectCallback,
} from './lib/types';
import Centrifuge from 'centrifuge';
import WebSocket from 'isomorphic-ws';
import getDispatcher from '../lib/dispatcher';

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
  subcriptions = new Map();

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

  private _centrifuge(token: string | null | undefined) {
    const url = `${this.option.url.replace('http', 'ws')}/connection/${
      this.option.apiKey
    }/websocket${token ? `?token=${token}` : ''}`;
    return new Centrifuge(url, {
      websocket: typeof window !== 'undefined' ? null : WebSocket,
      disableWithCredentials: false,
    });
  }

  subscribe<T>(
    name: string,
    { token, event, where }: SubscribeOption<T>,
    callback: RealtimeCallback,
    onDisconnect?: DisconnectCallback,
    onConnect?: ConnectCallback,
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        let key = `${name.toLowerCase().replace(' ', '-')}-${String(
          new Date().getTime(),
        )}`;

        const lastSubscribe = this.subcriptions.get(name);

        if (lastSubscribe) {
          lastSubscribe.unsubscribe();
        }

        let filter = '';

        if (where) {
          filter = ':' + qs.stringify(where, { encodeValuesOnly: true });
        }

        const res = await this._checkResponse(
          await fetch(
            `${this.option.url}/channel/${this.option.apiKey}/${name}`,
            {
              // @ts-expect-error
              dispatcher: await getDispatcher(),
            },
          ),
        );
        const data = (await res.json()) as { name: string };

        const channel = `${data.name}:${event || '*'}${filter}`;
        const centrifuge = this._centrifuge(token);

        const subscribe = centrifuge.subscribe(
          channel,
          function (message: any) {
            callback?.({
              key,
              event: message.data.eventType,
              payload: message.data.payload,
            });
          },
        );
        subscribe.on('error', function (err: any) {
          callback?.({
            key,
            event: 'ERROR',
            error: {
              message: err.message,
            },
          });
        });

        if (onConnect != null) {
          centrifuge.on('connect', onConnect);
        }

        if (onDisconnect != null) {
          centrifuge.on('disconnect', onDisconnect);
        }

        centrifuge.connect();

        this.subcriptions.set(key, centrifuge);

        resolve(key);
      } catch (error) {
        reject(error instanceof FailedHTTPResponse ? error.data : error);
      }
    });
  }

  unsubscribe(key: string): boolean {
    const subscription = this.subcriptions.get(key);
    if (subscription) {
      subscription.disconnect();
      this.subcriptions.delete(key);
    }

    return subscription ? true : false;
  }
}

import axios from 'axios';
import qs from 'qs';
import {
  RealtimeClientOption,
  RealtimeCallback,
  SubscribeOption,
} from './lib/types';
import Centrifuge from 'centrifuge';
import WebSocket from 'isomorphic-ws';
import { httpsAgent } from './lib/helpers';

export default class RealtimeClient {
  protected option: RealtimeClientOption;
  subcriptions = new Map();

  constructor(option: RealtimeClientOption) {
    this.option = option;
  }

  _centrifuge(token: string | null | undefined) {
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
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        let key = `${name.toLowerCase().replace(' ', '-')}-${String(
          new Date().getTime(),
        )}`;

        const lastSubscribe = this.subcriptions.get(name);

        if (lastSubscribe) {
          lastSubscribe.unsubscribe();
        }

        const getChannel = await axios.get(
          `${this.option.url}/channel/${this.option.apiKey}/${name}`,
          {
            httpsAgent: httpsAgent(),
          },
        );

        let filter = '';

        if (where) {
          filter = ':' + qs.stringify(where, { encodeValuesOnly: true });
        }

        const channel = `${getChannel.data.name}:${event || '*'}${filter}`;
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
        centrifuge.connect();

        this.subcriptions.set(key, centrifuge);

        resolve(key);
      } catch (error) {
        reject(error);
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

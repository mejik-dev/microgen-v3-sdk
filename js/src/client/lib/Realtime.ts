import type { AuthClient } from '../../auth';
import type {
  ConnectCallback,
  DisconnectCallback,
  RealtimeCallback,
  RealtimeClient,
  RealtimeRegolCallback,
  SubscribeOption,
  SubscribeRegolOption,
} from '../../realtime';

export default class Realtime {
  private _realtime: RealtimeClient;
  private _auth: AuthClient;

  constructor(realtime: RealtimeClient, auth: AuthClient) {
    this._realtime = realtime;
    this._auth = auth;
  }

  subscribe<T>(
    name: string,
    option: SubscribeOption<T>,
    callback: RealtimeCallback,
    onDisconnect?: DisconnectCallback,
    onConnect?: ConnectCallback,
  ) {
    return this._realtime.subscribe<T>(
      name,
      {
        event: option?.event,
        where: option?.where,
        token: option?.token ?? this._auth.token(),
      },
      callback,
      onDisconnect,
      onConnect,
    );
  }

  unsubscribe(key: string): boolean {
    return this._realtime.unsubscribe(key);
  }

  subscribeRegol(
    deviceId: string,
    option: SubscribeRegolOption,
    callback: RealtimeRegolCallback,
    onDisconnect?: DisconnectCallback,
    onConnect?: ConnectCallback,
  ) {
    return this._realtime.subscribeRegol(
      deviceId,
      { event: option?.event },
      callback,
      onDisconnect,
      onConnect,
    );
  }

  unsubscribeRegol(key: string): boolean {
    return this._realtime.unsubscribeRegol(key);
  }
}

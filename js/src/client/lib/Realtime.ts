import type { AuthClient } from '../../auth';
import type {
  ConnectCallback,
  DisconnectCallback,
  RealtimeCallback,
  RealtimeClient,
  SubscribeOption,
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
        where: option?.where,
        event: option?.event,
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
}

import type { AuthClient } from '../../auth';
import type {
  ConnectCallback,
  DisconnectCallback,
  RealtimeCallback,
  RealtimeClient,
  RealtimeRegolCallback,
  RealtimeResponse,
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

  async getTableId(tableName: string): Promise<RealtimeResponse> {
    return this._realtime.getTableId(tableName);
  }

  subscribe<T>(
    tableId: string,
    option: SubscribeOption<T>,
    callback: RealtimeCallback,
    onDisconnect?: DisconnectCallback,
    onConnect?: ConnectCallback,
  ) {
    this._realtime.subscribe<T>(
      tableId,
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

  unsubscribe(tableId: string) {
    this._realtime.unsubscribe(tableId);
  }

  subscribeRegol(
    deviceId: string,
    option: SubscribeRegolOption,
    callback: RealtimeRegolCallback,
    onDisconnect?: DisconnectCallback,
    onConnect?: ConnectCallback,
  ) {
    this._realtime.subscribeRegol(
      deviceId,
      { event: option?.event },
      callback,
      onDisconnect,
      onConnect,
    );
  }

  unsubscribeRegol(deviceId: string) {
    this._realtime.unsubscribeRegol(deviceId);
  }
}

import type { MicrogenClientOptions } from './lib/types';
import { QueryClient } from '..';
import { AuthClient } from '../auth';
import { RealtimeClient } from '../realtime';
import { StorageClient } from '../storage';
import Realtime from './lib/Realtime';

export default class MicrogenClient {
  auth: AuthClient;
  realtime: Realtime;
  storage: StorageClient;

  protected _realtimeClient: RealtimeClient;
  protected apiKey: string;
  protected queryUrl: string;
  protected realtimeUrl: string;
  protected headers: Record<string, string>;

  constructor(options: MicrogenClientOptions) {
    if (!options?.apiKey) throw new Error('apiKey is required');

    const host = options.host ?? 'v3.microgen.id';

    let protocol = 'http';

    if (options.isSecure ?? true) {
      protocol = 'https';
    }

    let queryUrl = `${protocol}://database-query.${host}/api/v1/`;
    let streamUrl = `${protocol}://database-stream.${host}`;

    if (options.queryUrl) {
      queryUrl = options.queryUrl;
    }

    if (options.streamUrl) {
      streamUrl = options.streamUrl;
    }

    this.queryUrl = `${queryUrl}${options.apiKey}`;
    this.realtimeUrl = streamUrl;
    this.apiKey = options.apiKey;
    this.headers = {};
    this.auth = this._initAuth();
    this._realtimeClient = this._initRealtime();

    this.realtime = new Realtime(this._realtimeClient, this.auth);
    this.storage = new StorageClient(`${this.queryUrl}/storage`, this.auth);
  }

  private _getHeaders(): Record<string, string> {
    const headers: Record<string, string> = this.headers;
    const authBearer = this.auth.token();
    if (authBearer && authBearer !== '') {
      headers.Authorization = `Bearer ${authBearer}`;
    }
    return headers;
  }

  private _initAuth() {
    return new AuthClient(this.queryUrl, {
      headers: this.headers,
    });
  }

  private _initRealtime() {
    return new RealtimeClient({
      url: this.realtimeUrl,
      apiKey: this.apiKey,
    });
  }

  service<T = any>(tableName: string): QueryClient<T> {
    return new QueryClient<T>(tableName, {
      url: this.queryUrl,
      headers: this._getHeaders(),
    });
  }
}

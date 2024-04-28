export interface RealtimeClientOption {
  url: string;
  apiKey: string;
}

interface ErrorMessage {
  message: string;
}

export type RealtimeEventTypes =
  | 'CREATE_RECORD'
  | 'UPDATE_RECORD'
  | 'DELETE_RECORD'
  | 'LINK_RECORD'
  | 'UNLINK_RECORD'
  | '*';

export type RealtimeRegolEventTypes =
  | 'USER_LOGGED_IN'
  | 'USER_LOGGED_OUT'
  | '*';

export interface RealtimeMessage {
  event:
    | 'CREATE_RECORD'
    | 'UPDATE_RECORD'
    | 'DELETE_RECORD'
    | `LINK_RECORD`
    | `UNLINK_RECORD`
    | 'ERROR';
  payload?: any;
  error?: ErrorMessage;
}

export interface RealtimeRegolMessage {
  event: 'USER_LOGGED_IN' | 'USER_LOGGED_OUT' | 'ERROR';
  payload?: any;
  error?: ErrorMessage;
}

export type RealtimeCallback = (m: RealtimeMessage) => any;
export type RealtimeRegolCallback = (m: RealtimeRegolMessage) => any;
export type DisconnectCallback = () => any;
export type ConnectCallback = () => any;

export interface SubscribeOption<T> {
  event: RealtimeEventTypes;
  where?: Partial<T>;
  token?: string | null;
}

export interface SubscribeRegolOption {
  event: RealtimeRegolEventTypes;
}

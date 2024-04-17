interface AuthResponseBase {
  status: number;
  statusText: string;
}

export interface AuthError {
  message: string;
}

export interface AuthResponseFailure extends AuthResponseBase {
  error?: AuthError;
  user?: null;
  token?: null;
}

export interface AuthResponseSuccess<T> extends AuthResponseBase {
  error?: AuthError;
  user: T;
  token: string;
}

export type AuthResponse<T> = AuthResponseSuccess<T> | AuthResponseFailure;

export interface TokenResponse<T> {
  token: string;
  user: T;
}

export interface ProfileResponseSuccess<T> extends AuthResponseBase {
  error?: null;
  user?: T;
}

export type ProfileResponse<T> =
  | ProfileResponseSuccess<T>
  | AuthResponseFailure;

type FieldLookup<T> = {
  [P in keyof Partial<T> | string]:
    | {
        ['$lookup']: Lookup<Record<string, unknown>>;
      }
    | '*';
};

export interface Lookup<T> {
  '*'?: (FieldLookup<T> | keyof T)[];
  _id?: (FieldLookup<T> | keyof T | '*')[];
}

export interface GetUserOption<T> {
  lookup?: (keyof Partial<T>)[] | '*' | Lookup<T>;
}
